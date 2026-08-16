import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { normalizeWhatsAppNumber } from '../common/utils/whatsapp-formatter.util';

import * as XLSX from 'xlsx';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async exportToExcel() {
    const teachers = await this.prisma.teacher.findMany({
      where: { deletedAt: null },
      orderBy: { teacherCode: 'asc' },
    });

    const rows = teachers.map((t, idx) => ({
      No: idx + 1,
      'Kode Guru': t.teacherCode,
      'Nama Lengkap': t.fullName,
      'Mata Pelajaran': t.subject,
      'Nomor WhatsApp': t.whatsappNumber,
      Status: t.isActive ? 'AKTIF' : 'NON-AKTIF',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getImportTemplate() {
    const sampleRows = [
      {
        'Kode Guru': 'GRU-101',
        'Nama Lengkap': 'Drs. Hendra Saputra, M.Pd.',
        'Mata Pelajaran': 'Matematika',
        'Nomor WhatsApp': '081234567890',
      },
      {
        'Kode Guru': 'GRU-102',
        'Nama Lengkap': 'Dewi Anggraini, S.Pd.',
        'Mata Pelajaran': 'Bahasa Inggris',
        'Nomor WhatsApp': '081987654321',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Guru');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async previewImport(
    rows: Array<{
      teacherCode: string;
      fullName: string;
      subject: string;
      whatsappNumber: string;
    }>,
  ) {
    const previewItems = [];
    let duplicateCount = 0;
    let newCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const normalizedCode = (row.teacherCode || '').trim().toUpperCase();

      const existing = normalizedCode
        ? await this.prisma.teacher.findUnique({ where: { teacherCode: normalizedCode } })
        : null;

      const isDuplicate = !!existing;
      if (isDuplicate) duplicateCount++;
      else newCount++;

      previewItems.push({
        rowNum,
        teacherCode: normalizedCode,
        fullName: (row.fullName || '').trim(),
        subject: (row.subject || '').trim(),
        whatsappNumber: (row.whatsappNumber || '').trim(),
        isDuplicate,
        existingName: existing ? existing.fullName : null,
      });
    }

    return {
      success: true,
      data: {
        totalRows: rows.length,
        duplicateCount,
        newCount,
        previewItems,
      },
    };
  }

  async importFromRows(
    rows: Array<{
      teacherCode: string;
      fullName: string;
      subject: string;
      whatsappNumber: string;
    }>,
    duplicateAction: 'SKIP' | 'OVERWRITE' = 'SKIP',
    userId?: string,
  ) {
    const results = {
      successCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.teacherCode || !row.fullName || !row.subject || !row.whatsappNumber) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Data tidak lengkap (Kode, Nama, Mapel, WA wajib diisi)`);
        continue;
      }

      const normalizedCode = row.teacherCode.trim().toUpperCase();
      const existing = await this.prisma.teacher.findUnique({
        where: { teacherCode: normalizedCode },
      });

      const normalizedPhone = normalizeWhatsAppNumber(row.whatsappNumber);

      if (existing) {
        if (duplicateAction === 'SKIP') {
          results.skippedCount++;
          continue;
        } else if (duplicateAction === 'OVERWRITE') {
          try {
            await this.prisma.teacher.update({
              where: { id: existing.id },
              data: {
                fullName: row.fullName.trim(),
                subject: row.subject.trim(),
                whatsappNumber: normalizedPhone,
                deletedAt: null,
                isActive: true,
              },
            });
            results.updatedCount++;
          } catch (err: any) {
            results.errorCount++;
            results.errors.push(`Baris ${rowNum}: Gagal menimpa data - ${err.message}`);
          }
          continue;
        }
      }

      try {
        await this.prisma.teacher.create({
          data: {
            teacherCode: normalizedCode,
            fullName: row.fullName.trim(),
            subject: row.subject.trim(),
            whatsappNumber: normalizedPhone,
            gender: (row as any).gender || 'MALE',
            isActive: true,
          },
        });
        results.successCount++;
      } catch (err: any) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Gagal menyimpan - ${err.message}`);
      }
    }

    return {
      success: true,
      data: results,
    };
  }

  async create(dto: CreateTeacherDto, userId?: string) {
    const existing = await this.prisma.teacher.findUnique({
      where: { teacherCode: dto.teacherCode },
    });

    if (existing) {
      throw new ConflictException(`Kode guru '${dto.teacherCode}' sudah digunakan`);
    }

    const normalizedPhone = normalizeWhatsAppNumber(dto.whatsappNumber);

    const teacher = await this.prisma.teacher.create({
      data: {
        ...dto,
        whatsappNumber: normalizedPhone,
      },
    });

    await this.logAudit(userId, 'CREATE', 'Teacher', teacher.id, null, teacher);

    return {
      success: true,
      data: teacher,
    };
  }

  async findAll(query: QueryTeacherDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { teacherCode: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'fullName']: query.sortOrder || 'asc' },
      }),
      this.prisma.teacher.count({ where }),
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
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
      include: {
        homeroomClasses: true,
        user: { select: { id: true, username: true, role: true } },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Guru dengan ID '${id}' tidak ditemukan`);
    }

    return {
      success: true,
      data: teacher,
    };
  }

  async update(id: string, dto: UpdateTeacherDto, userId?: string) {
    const existing = await this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Guru dengan ID '${id}' tidak ditemukan`);
    }

    if (dto.teacherCode && dto.teacherCode !== existing.teacherCode) {
      const codeCheck = await this.prisma.teacher.findUnique({
        where: { teacherCode: dto.teacherCode },
      });
      if (codeCheck) {
        throw new ConflictException(`Kode guru '${dto.teacherCode}' sudah digunakan`);
      }
    }

    const updateData: any = { ...dto };
    if (dto.whatsappNumber) {
      updateData.whatsappNumber = normalizeWhatsAppNumber(dto.whatsappNumber);
    }

    const updated = await this.prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    await this.logAudit(userId, 'UPDATE', 'Teacher', id, existing, updated);

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Guru dengan ID '${id}' tidak ditemukan`);
    }

    // Soft delete to protect historical attendance data
    const updated = await this.prisma.teacher.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await this.logAudit(userId, 'SOFT_DELETE', 'Teacher', id, existing, updated);

    return {
      success: true,
      message: `Data guru '${existing.fullName}' berhasil dinonaktifkan/dihapus`,
    };
  }

  async searchPublic(query: string) {
    if (!query || query.length < 2) {
      return { success: true, data: [] };
    }

    const teachers = await this.prisma.teacher.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { teacherCode: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        teacherCode: true,
        fullName: true,
        subject: true,
        photoUrl: true,
      },
      take: 10,
    });

    return {
      success: true,
      data: teachers,
    };
  }

  async getPublicTeacherSummary(teacherCode: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { teacherCode, deletedAt: null, isActive: true },
      select: {
        id: true,
        teacherCode: true,
        fullName: true,
        subject: true,
        photoUrl: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Guru dengan kode '${teacherCode}' tidak ditemukan`);
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where: { schedule: { teacherId: teacher.id } },
    });

    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const totalCount = records.length;
    const cleanRecord = totalCount > 0 && records.every((r) => r.status === 'PRESENT');

    return {
      success: true,
      data: {
        teacher,
        summary: {
          totalCount,
          present: presentCount,
          permission: records.filter((r) => r.status === 'PERMISSION').length,
          sick: records.filter((r) => r.status === 'SICK').length,
          officialDuty: records.filter((r) => r.status === 'OFFICIAL_DUTY').length,
          pending: records.filter((r) => r.status === 'ABSENT_PENDING_CONFIRMATION').length,
        },
        appreciationMessage: cleanRecord
          ? 'Penghargaan: Terima kasih atas dedikasi dan tingkat kehadiran 100%!'
          : null,
      },
    };
  }

  async getPublicTeacherHistory(teacherCode: string, month?: string, status?: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { teacherCode, deletedAt: null, isActive: true },
      select: { id: true, teacherCode: true, fullName: true, subject: true },
    });

    if (!teacher) {
      throw new NotFoundException(`Guru dengan kode '${teacherCode}' tidak ditemukan`);
    }

    const where: any = { schedule: { teacherId: teacher.id } };
    if (status) where.status = status;

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        schedule: {
          include: {
            class: { select: { name: true, grade: true } },
            lessonPeriod: { select: { periodNumber: true, startTime: true, endTime: true } },
          },
        },
      },
      orderBy: { attendanceDate: 'desc' },
      take: 50,
    });

    return {
      success: true,
      data: records.map((r) => ({
        id: r.id,
        attendanceDate: r.attendanceDate.toISOString().split('T')[0],
        status: r.status,
        notes: r.notes,
        className: r.schedule.class.name,
        periodNumber: r.schedule.lessonPeriod.periodNumber,
        periodTime: `${r.schedule.lessonPeriod.startTime} - ${r.schedule.lessonPeriod.endTime}`,
        subject: r.schedule.subject,
      })),
    };
  }

  private async logAudit(
    userId: string | undefined,
    action: string,
    entity: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          entity,
          entityId,
          oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
          newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
        },
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  }
}
