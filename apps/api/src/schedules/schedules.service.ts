import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { CopySemesterScheduleDto } from './dto/copy-semester.dto';
import { DayOfWeek } from '@prisma/client';

import * as XLSX from 'xlsx';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async exportToExcel() {
    const schedules = await this.prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        teacher: true,
        class: true,
        lessonPeriod: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { lessonPeriodId: 'asc' }],
    });

    const rows = schedules.map((s, idx) => ({
      No: idx + 1,
      Hari: s.dayOfWeek,
      'Kode Guru': s.teacher.teacherCode,
      'Nama Guru': s.teacher.fullName,
      'Nama Kelas': s.class.name,
      'Jam Ke': s.lessonPeriod.periodNumber,
      'Mata Pelajaran': s.subject,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Mengajar');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getImportTemplate() {
    const sampleRows = [
      {
        Hari: 'MONDAY',
        'Kode Guru': 'GRU-001',
        'Nama Kelas': 'X IPA 1',
        'Jam Ke': 1,
        'Mata Pelajaran': 'Matematika',
      },
      {
        Hari: 'MONDAY',
        'Kode Guru': 'GRU-002',
        'Nama Kelas': 'X IPA 1',
        'Jam Ke': 2,
        'Mata Pelajaran': 'Bahasa Indonesia',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Jadwal');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async previewImport(
    rows: Array<{
      dayOfWeek: DayOfWeek;
      teacherCode: string;
      className: string;
      periodNumber: number;
      subject: string;
    }>,
  ) {
    const previewItems = [];
    let conflictCount = 0;
    let newCount = 0;

    const semester = await this.prisma.semester.findFirst({
      where: { isActive: true },
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      let isConflict = false;
      let conflictReason: string | null = null;

      const teacher = row.teacherCode
        ? await this.prisma.teacher.findFirst({
            where: { teacherCode: row.teacherCode.trim().toUpperCase(), deletedAt: null },
          })
        : null;

      const cls = row.className
        ? await this.prisma.class.findFirst({
            where: { name: row.className.trim(), deletedAt: null },
          })
        : null;

      const lessonPeriod = row.periodNumber
        ? await this.prisma.lessonPeriod.findFirst({
            where: { periodNumber: Number(row.periodNumber) },
          })
        : null;

      if (!teacher || !cls || !lessonPeriod || !semester) {
        isConflict = true;
        conflictReason = 'Data referensi (Guru/Kelas/Jam/Semester) tidak valid';
      } else {
        try {
          await this.validateScheduleConflict(
            teacher.id,
            cls.id,
            lessonPeriod.id,
            row.dayOfWeek,
            semester.id,
          );
        } catch (err: any) {
          isConflict = true;
          conflictReason = err.message || 'Bentrok jadwal detected';
        }
      }

      if (isConflict) conflictCount++;
      else newCount++;

      previewItems.push({
        rowNum,
        dayOfWeek: row.dayOfWeek,
        teacherCode: row.teacherCode,
        teacherName: teacher ? teacher.fullName : null,
        className: row.className,
        periodNumber: row.periodNumber,
        subject: row.subject,
        isConflict,
        conflictReason,
      });
    }

    return {
      success: true,
      data: {
        totalRows: rows.length,
        conflictCount,
        newCount,
        previewItems,
      },
    };
  }

  async importFromRows(
    rows: Array<{
      dayOfWeek: DayOfWeek;
      teacherCode: string;
      className: string;
      periodNumber: number;
      subject: string;
    }>,
    conflictAction: 'SKIP' | 'OVERWRITE' = 'SKIP',
    userId?: string,
  ) {
    const results = {
      successCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as string[],
    };

    const semester = await this.prisma.semester.findFirst({
      where: { isActive: true },
    });

    if (!semester) {
      throw new BadRequestException('Tidak ada Semester Aktif ditemukan');
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.dayOfWeek || !row.teacherCode || !row.className || !row.periodNumber || !row.subject) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Data tidak lengkap (Hari, Kode Guru, Kelas, Jam Ke, Mapel)`);
        continue;
      }

      const teacher = await this.prisma.teacher.findFirst({
        where: { teacherCode: row.teacherCode.trim().toUpperCase(), deletedAt: null },
      });

      if (!teacher) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Guru dengan kode '${row.teacherCode}' tidak ditemukan`);
        continue;
      }

      const cls = await this.prisma.class.findFirst({
        where: { name: row.className.trim(), deletedAt: null },
      });

      if (!cls) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Kelas '${row.className}' tidak ditemukan`);
        continue;
      }

      const lessonPeriod = await this.prisma.lessonPeriod.findFirst({
        where: { periodNumber: Number(row.periodNumber) },
      });

      if (!lessonPeriod) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Jam pelajaran Ke-${row.periodNumber} tidak ditemukan`);
        continue;
      }

      let hasConflict = false;
      try {
        await this.validateScheduleConflict(
          teacher.id,
          cls.id,
          lessonPeriod.id,
          row.dayOfWeek,
          semester.id,
        );
      } catch (err: any) {
        hasConflict = true;
      }

      if (hasConflict) {
        if (conflictAction === 'SKIP') {
          results.skippedCount++;
          continue;
        } else if (conflictAction === 'OVERWRITE') {
          try {
            await this.prisma.schedule.deleteMany({
              where: {
                dayOfWeek: row.dayOfWeek,
                lessonPeriodId: lessonPeriod.id,
                semesterId: semester.id,
                OR: [{ teacherId: teacher.id }, { classId: cls.id }],
              },
            });
            await this.prisma.schedule.create({
              data: {
                teacherId: teacher.id,
                classId: cls.id,
                lessonPeriodId: lessonPeriod.id,
                semesterId: semester.id,
                dayOfWeek: row.dayOfWeek,
                subject: row.subject.trim(),
                periodValidFrom: new Date('2026-01-01T00:00:00.000Z'),
                periodValidTo: new Date('2026-12-31T23:59:59.999Z'),
                isActive: true,
              },
            });
            results.updatedCount++;
          } catch (err: any) {
            results.errorCount++;
            results.errors.push(`Baris ${rowNum}: Gagal menimpa jadwal bentrok - ${err.message}`);
          }
          continue;
        }
      }

      try {
        await this.prisma.schedule.create({
          data: {
            teacherId: teacher.id,
            classId: cls.id,
            lessonPeriodId: lessonPeriod.id,
            semesterId: semester.id,
            dayOfWeek: row.dayOfWeek,
            subject: row.subject.trim(),
            periodValidFrom: new Date('2026-01-01T00:00:00.000Z'),
            periodValidTo: new Date('2026-12-31T23:59:59.999Z'),
            isActive: true,
          },
        });
        results.successCount++;
      } catch (err: any) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Bentrok/Gagal - ${err.message}`);
      }
    }

    return {
      success: true,
      data: results,
    };
  }

  async create(dto: CreateScheduleDto, userId?: string) {
    // 1. Conflict Validation
    await this.validateScheduleConflict(
      dto.teacherId,
      dto.classId,
      dto.lessonPeriodId,
      dto.dayOfWeek,
      dto.semesterId,
    );

    const schedule = await this.prisma.schedule.create({
      data: {
        teacherId: dto.teacherId,
        classId: dto.classId,
        lessonPeriodId: dto.lessonPeriodId,
        semesterId: dto.semesterId,
        dayOfWeek: dto.dayOfWeek,
        subject: dto.subject,
        periodValidFrom: new Date(dto.periodValidFrom),
        periodValidTo: new Date(dto.periodValidTo),
        isActive: true,
      },
      include: {
        teacher: true,
        class: true,
        lessonPeriod: true,
        semester: true,
      },
    });

    await this.logAudit(userId, 'CREATE', 'Schedule', schedule.id, null, schedule);

    return {
      success: true,
      data: schedule,
    };
  }

  async findAll(query: QueryScheduleDto) {
    const where: any = {};

    if (query.teacherId) where.teacherId = query.teacherId;
    if (query.classId) where.classId = query.classId;
    if (query.dayOfWeek) where.dayOfWeek = query.dayOfWeek;
    if (query.semesterId) where.semesterId = query.semesterId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        teacher: { select: { id: true, teacherCode: true, fullName: true, subject: true } },
        class: { select: { id: true, name: true, grade: true } },
        lessonPeriod: { select: { id: true, periodNumber: true, startTime: true, endTime: true } },
        semester: { select: { id: true, name: true, type: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { lessonPeriod: { periodNumber: 'asc' } },
      ],
    });

    return {
      success: true,
      data: schedules,
    };
  }

  async getTodaySchedules() {
    const todayDayOfWeek = this.getTodayDayOfWeek();

    const activeSemester = await this.prisma.semester.findFirst({
      where: { isActive: true },
    });

    const where: any = {
      dayOfWeek: todayDayOfWeek,
      isActive: true,
    };

    if (activeSemester) {
      where.semesterId = activeSemester.id;
    }

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        teacher: { select: { id: true, teacherCode: true, fullName: true, whatsappNumber: true, subject: true } },
        class: { select: { id: true, name: true, grade: true } },
        lessonPeriod: { select: { id: true, periodNumber: true, startTime: true, endTime: true } },
      },
      orderBy: { lessonPeriod: { periodNumber: 'asc' } },
    });

    return {
      success: true,
      data: {
        dayOfWeek: todayDayOfWeek,
        date: new Date().toISOString().split('T')[0],
        schedules,
      },
    };
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        teacher: true,
        class: true,
        lessonPeriod: true,
        semester: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Jadwal dengan ID '${id}' tidak ditemukan`);
    }

    return {
      success: true,
      data: schedule,
    };
  }

  async update(id: string, dto: UpdateScheduleDto, userId?: string) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Jadwal dengan ID '${id}' tidak ditemukan`);
    }

    const teacherId = dto.teacherId || existing.teacherId;
    const classId = dto.classId || existing.classId;
    const lessonPeriodId = dto.lessonPeriodId || existing.lessonPeriodId;
    const dayOfWeek = dto.dayOfWeek || existing.dayOfWeek;
    const semesterId = dto.semesterId || existing.semesterId;

    await this.validateScheduleConflict(
      teacherId,
      classId,
      lessonPeriodId,
      dayOfWeek,
      semesterId,
      id,
    );

    const updateData: any = { ...dto };
    if (dto.periodValidFrom) updateData.periodValidFrom = new Date(dto.periodValidFrom);
    if (dto.periodValidTo) updateData.periodValidTo = new Date(dto.periodValidTo);

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: updateData,
      include: { teacher: true, class: true, lessonPeriod: true, semester: true },
    });

    await this.logAudit(userId, 'UPDATE', 'Schedule', id, existing, updated);

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Jadwal dengan ID '${id}' tidak ditemukan`);
    }

    await this.prisma.schedule.delete({ where: { id } });

    await this.logAudit(userId, 'DELETE', 'Schedule', id, existing, null);

    return {
      success: true,
      message: 'Jadwal mengajar berhasil dihapus',
    };
  }

  async copySemesterSchedules(dto: CopySemesterScheduleDto, userId?: string) {
    const sourceSchedules = await this.prisma.schedule.findMany({
      where: { semesterId: dto.sourceSemesterId, isActive: true },
    });

    if (sourceSchedules.length === 0) {
      throw new BadRequestException('Tidak ada jadwal aktif pada semester sumber');
    }

    const targetSemester = await this.prisma.semester.findUnique({
      where: { id: dto.targetSemesterId },
    });

    if (!targetSemester) {
      throw new NotFoundException('Semester tujuan tidak ditemukan');
    }

    let createdCount = 0;
    await this.prisma.$transaction(async (tx) => {
      for (const s of sourceSchedules) {
        await tx.schedule.create({
          data: {
            teacherId: s.teacherId,
            classId: s.classId,
            lessonPeriodId: s.lessonPeriodId,
            semesterId: dto.targetSemesterId,
            dayOfWeek: s.dayOfWeek,
            subject: s.subject,
            periodValidFrom: targetSemester.startDate,
            periodValidTo: targetSemester.endDate,
            isActive: true,
          },
        });
        createdCount++;
      }
    });

    await this.logAudit(userId, 'COPY_SEMESTER_SCHEDULES', 'Semester', dto.targetSemesterId, { count: createdCount });

    return {
      success: true,
      message: `Berhasil menduplikasi ${createdCount} jadwal ke semester tujuan`,
    };
  }

  private async validateScheduleConflict(
    teacherId: string,
    classId: string,
    lessonPeriodId: string,
    dayOfWeek: DayOfWeek,
    semesterId: string,
    excludeScheduleId?: string,
  ) {
    // Check 1: Teacher Conflict
    const teacherConflict = await this.prisma.schedule.findFirst({
      where: {
        teacherId,
        lessonPeriodId,
        dayOfWeek,
        semesterId,
        isActive: true,
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
      },
      include: { teacher: true, class: true, lessonPeriod: true },
    });

    if (teacherConflict) {
      throw new ConflictException(
        `Bentrokan Guru: Guru '${teacherConflict.teacher.fullName}' sudah memiliki jadwal mengajar di kelas '${teacherConflict.class.name}' pada jam ke-${teacherConflict.lessonPeriod.periodNumber} hari ${dayOfWeek}`,
      );
    }

    // Check 2: Class Conflict
    const classConflict = await this.prisma.schedule.findFirst({
      where: {
        classId,
        lessonPeriodId,
        dayOfWeek,
        semesterId,
        isActive: true,
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
      },
      include: { teacher: true, class: true, lessonPeriod: true },
    });

    if (classConflict) {
      throw new ConflictException(
        `Bentrokan Kelas: Kelas '${classConflict.class.name}' sudah terisi jadwal mengajar oleh guru '${classConflict.teacher.fullName}' pada jam ke-${classConflict.lessonPeriod.periodNumber} hari ${dayOfWeek}`,
      );
    }
  }

  private getTodayDayOfWeek(): DayOfWeek {
    const daysMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    return daysMap[new Date().getDay()] || DayOfWeek.MONDAY;
  }

  private async logAudit(userId: string | undefined, action: string, entity: string, entityId: string, oldVal?: any, newVal?: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
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
