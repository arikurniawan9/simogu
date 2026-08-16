import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
import { QueryChangeRequestDto } from './dto/query-change-request.dto';
import { ChangeRequestStatus } from '@prisma/client';

@Injectable()
export class ChangeRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChangeRequestDto, userId: string) {
    const attendanceRecord = await this.prisma.attendanceRecord.findUnique({
      where: { id: dto.attendanceRecordId },
    });

    if (!attendanceRecord) {
      throw new NotFoundException(`Record absensi ID '${dto.attendanceRecordId}' tidak ditemukan`);
    }

    // Check if there is already a PENDING request for this record
    const existingPending = await this.prisma.attendanceChangeRequest.findFirst({
      where: {
        attendanceRecordId: dto.attendanceRecordId,
        status: ChangeRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException('Sudah ada pengajuan perubahan status yang sedang menunggu persetujuan');
    }

    const changeRequest = await this.prisma.attendanceChangeRequest.create({
      data: {
        attendanceRecordId: dto.attendanceRecordId,
        requestedById: userId,
        currentStatus: attendanceRecord.status,
        requestedStatus: dto.requestedStatus,
        reason: dto.reason,
        status: ChangeRequestStatus.PENDING,
        attachments: dto.attachmentUrl
          ? {
              create: {
                fileUrl: dto.attachmentUrl,
                fileType: 'document',
                fileSize: 1024,
              },
            }
          : undefined,
      },
      include: {
        attendanceRecord: true,
        requestedBy: { select: { id: true, username: true, fullName: true } },
        attachments: true,
      },
    });

    await this.logAudit(userId, 'SUBMIT_CHANGE_REQUEST', 'AttendanceChangeRequest', changeRequest.id, null, changeRequest);

    return {
      success: true,
      message: 'Pengajuan perubahan status absensi berhasil dikirim',
      data: changeRequest,
    };
  }

  async findAll(query: QueryChangeRequestDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.attendanceChangeRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          attendanceRecord: {
            include: {
              schedule: {
                include: {
                  teacher: { select: { id: true, teacherCode: true, fullName: true, subject: true } },
                  class: { select: { id: true, name: true, grade: true } },
                  lessonPeriod: { select: { id: true, periodNumber: true, startTime: true, endTime: true } },
                },
              },
            },
          },
          requestedBy: { select: { id: true, username: true, fullName: true } },
          reviewedBy: { select: { id: true, username: true, fullName: true } },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendanceChangeRequest.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.attendanceChangeRequest.findUnique({
      where: { id },
      include: {
        attendanceRecord: {
          include: {
            schedule: {
              include: {
                teacher: true,
                class: true,
                lessonPeriod: true,
              },
            },
          },
        },
        requestedBy: { select: { id: true, username: true, fullName: true } },
        reviewedBy: { select: { id: true, username: true, fullName: true } },
        attachments: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Pengajuan perubahan ID '${id}' tidak ditemukan`);
    }

    return {
      success: true,
      data: item,
    };
  }

  async approve(id: string, reviewerId: string, dto?: ReviewChangeRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.attendanceChangeRequest.findUnique({
        where: { id },
        include: { attendanceRecord: true },
      });

      if (!request) {
        throw new NotFoundException(`Pengajuan perubahan ID '${id}' tidak ditemukan`);
      }

      // Check 1: Prevent re-processing completed requests (race condition check)
      if (request.status !== ChangeRequestStatus.PENDING) {
        throw new ConflictException('Pengajuan ini telah diproses sebelumnya');
      }

      // Check 2: Requester cannot approve their own request
      if (request.requestedById === reviewerId) {
        throw new ForbiddenException('Anda tidak dapat menyetujui pengajuan perubahan yang Anda buat sendiri');
      }

      const oldStatus = request.attendanceRecord.status;
      const newStatus = request.requestedStatus;

      // 1. Update AttendanceRecord Status
      const updatedRecord = await tx.attendanceRecord.update({
        where: { id: request.attendanceRecordId },
        data: { status: newStatus },
      });

      // 2. Create Status History Record
      await tx.attendanceStatusHistory.create({
        data: {
          attendanceRecordId: request.attendanceRecordId,
          previousStatus: oldStatus,
          newStatus: newStatus,
          changedById: reviewerId,
          reason: `Persetujuan pengajuan perubahan: ${request.reason}`,
        },
      });

      // 3. Update AttendanceChangeRequest Status
      const updatedRequest = await tx.attendanceChangeRequest.update({
        where: { id },
        data: {
          status: ChangeRequestStatus.APPROVED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: dto?.reviewNotes || 'Pengajuan perubahan status telah disetujui',
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: 'APPROVE_CHANGE_REQUEST',
          entity: 'AttendanceChangeRequest',
          entityId: id,
          oldValues: { status: oldStatus },
          newValues: { status: newStatus, request: updatedRequest },
        },
      });

      return {
        success: true,
        message: 'Pengajuan perubahan status absensi berhasil disetujui',
        data: updatedRequest,
      };
    });
  }

  async reject(id: string, reviewerId: string, dto?: ReviewChangeRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.attendanceChangeRequest.findUnique({
        where: { id },
        include: { attendanceRecord: true },
      });

      if (!request) {
        throw new NotFoundException(`Pengajuan perubahan ID '${id}' tidak ditemukan`);
      }

      if (request.status !== ChangeRequestStatus.PENDING) {
        throw new ConflictException('Pengajuan ini telah diproses sebelumnya');
      }

      if (request.requestedById === reviewerId) {
        throw new ForbiddenException('Anda tidak dapat menolak pengajuan yang Anda buat sendiri');
      }

      // Update ChangeRequest to REJECTED (AttendanceRecord status remains UNCHANGED)
      const updatedRequest = await tx.attendanceChangeRequest.update({
        where: { id },
        data: {
          status: ChangeRequestStatus.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: dto?.reviewNotes || 'Pengajuan ditolak oleh Admin',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: 'REJECT_CHANGE_REQUEST',
          entity: 'AttendanceChangeRequest',
          entityId: id,
          newValues: updatedRequest,
        },
      });

      return {
        success: true,
        message: 'Pengajuan perubahan status absensi berhasil ditolak',
        data: updatedRequest,
      };
    });
  }

  private async logAudit(userId: string, action: string, entity: string, entityId: string, oldVal?: any, newVal?: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          oldValues: oldVal ? JSON.parse(JSON.stringify(oldVal)) : undefined,
          newValues: newVal ? JSON.parse(JSON.stringify(newVal)) : undefined,
        },
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  }
}
