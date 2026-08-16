import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createAttendance(dto: CreateAttendanceDto, recordedByUserId?: string) {
    if (!dto.scheduleIds || dto.scheduleIds.length === 0) {
      throw new BadRequestException('Minimal 1 jadwal mengajar harus dipilih');
    }

    const attendanceDate = new Date(`${dto.attendanceDate}T00:00:00.000Z`);

    // Verify all schedules exist and are active
    const schedules = await this.prisma.schedule.findMany({
      where: {
        id: { in: dto.scheduleIds },
        isActive: true,
      },
      include: { teacher: true, class: true, lessonPeriod: true },
    });

    if (schedules.length !== dto.scheduleIds.length) {
      throw new NotFoundException('Satu atau lebih jadwal mengajar tidak ditemukan atau tidak aktif');
    }

    const createdRecords: any[] = [];

    // Transaction for bulk recording
    await this.prisma.$transaction(async (tx) => {
      for (const schedule of schedules) {
        // Check duplicate constraint
        const existing = await tx.attendanceRecord.findUnique({
          where: {
            scheduleId_attendanceDate: {
              scheduleId: schedule.id,
              attendanceDate,
            },
          },
        });

        if (existing) {
          throw new ConflictException(
            `Absensi untuk guru '${schedule.teacher.fullName}' di kelas '${schedule.class.name}' (Jam ke-${schedule.lessonPeriod.periodNumber}) tanggal ${dto.attendanceDate} sudah dicatat sebelumnya`,
          );
        }

        const record = await tx.attendanceRecord.create({
          data: {
            scheduleId: schedule.id,
            attendanceDate,
            status: dto.status,
            notes: dto.notes,
            recordedById: recordedByUserId || (await this.getFallbackAdminId(tx)),
          },
          include: {
            schedule: {
              include: {
                teacher: true,
                class: true,
                lessonPeriod: true,
              },
            },
          },
        });

        // Create Status History
        await tx.attendanceStatusHistory.create({
          data: {
            attendanceRecordId: record.id,
            previousStatus: dto.status,
            newStatus: dto.status,
            changedById: recordedByUserId || (await this.getFallbackAdminId(tx)),
            reason: dto.notes || 'Pencatatan absensi awal oleh petugas piket',
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            userId: recordedByUserId || null,
            action: 'CREATE_ATTENDANCE',
            entity: 'AttendanceRecord',
            entityId: record.id,
            newValues: JSON.parse(JSON.stringify(record)),
          },
        });

        createdRecords.push(record);
      }
    });

    return {
      success: true,
      message: `Berhasil mencatat ${createdRecords.length} absensi guru`,
      data: createdRecords,
    };
  }

  async findAll(query: QueryAttendanceDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.attendanceDate) {
      where.attendanceDate = new Date(`${query.attendanceDate}T00:00:00.000Z`);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.teacherId || query.classId) {
      where.schedule = {};
      if (query.teacherId) where.schedule.teacherId = query.teacherId;
      if (query.classId) where.schedule.classId = query.classId;
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          schedule: {
            include: {
              teacher: { select: { id: true, teacherCode: true, fullName: true, subject: true, whatsappNumber: true } },
              class: { select: { id: true, name: true, grade: true } },
              lessonPeriod: { select: { id: true, periodNumber: true, startTime: true, endTime: true } },
            },
          },
          recordedBy: { select: { id: true, username: true, fullName: true } },
          statusHistories: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { attendanceDate: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where }),
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

  async getTodaySummary(dateStr?: string) {
    const dateQuery = dateStr || new Date().toISOString().split('T')[0];
    const attendanceDate = new Date(`${dateQuery}T00:00:00.000Z`);

    const records = await this.prisma.attendanceRecord.findMany({
      where: { attendanceDate },
    });

    const summary = {
      date: dateQuery,
      totalRecorded: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absentPending: records.filter((r) => r.status === AttendanceStatus.ABSENT_PENDING_CONFIRMATION).length,
      permission: records.filter((r) => r.status === AttendanceStatus.PERMISSION).length,
      sick: records.filter((r) => r.status === AttendanceStatus.SICK).length,
      officialDuty: records.filter((r) => r.status === AttendanceStatus.OFFICIAL_DUTY).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      withoutExplanation: records.filter((r) => r.status === AttendanceStatus.WITHOUT_EXPLANATION).length,
    };

    return {
      success: true,
      data: summary,
    };
  }

  private async getFallbackAdminId(tx: any): Promise<string> {
    const admin = await tx.user.findFirst();
    return admin?.id || '';
  }
}
