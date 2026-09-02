import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePengajianClassDto } from './dto/create-pengajian-class.dto';
import { CreatePengajianScheduleDto } from './dto/create-pengajian-schedule.dto';
import { RecordPengajianAttendanceDto } from './dto/record-pengajian-attendance.dto';
import { DayOfWeek, PengajianSession, AttendanceStatus } from '@prisma/client';

@Injectable()
export class PengajianService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // HALAQAH / KELAS PENGAJIAN
  // ==========================================

  async findAllClasses(search?: string, category?: string) {
    const where: any = { isActive: true, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    return this.prisma.pengajianClass.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { schedules: true },
        },
      },
    });
  }

  async findClassById(id: string) {
    const cls = await this.prisma.pengajianClass.findUnique({
      where: { id },
      include: { schedules: true },
    });
    if (!cls || cls.deletedAt) {
      throw new NotFoundException(`Halaqah pengajian dengan ID '${id}' tidak ditemukan`);
    }
    return cls;
  }

  async createClass(dto: CreatePengajianClassDto) {
    return this.prisma.pengajianClass.create({
      data: {
        name: dto.name,
        category: dto.category,
        location: dto.location,
        description: dto.description,
        isActive: true,
      },
    });
  }

  async updateClass(id: string, dto: Partial<CreatePengajianClassDto>) {
    await this.findClassById(id);
    return this.prisma.pengajianClass.update({
      where: { id },
      data: dto,
    });
  }

  async deleteClass(id: string) {
    await this.findClassById(id);
    return this.prisma.pengajianClass.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // ==========================================
  // JADWAL PENGAJIAN (PAGI, ASHAR, MAGHRIB)
  // ==========================================

  async findAllSchedules(session?: PengajianSession, dayOfWeek?: DayOfWeek, classId?: string) {
    const where: any = { isActive: true };

    if (session) {
      where.session = session;
    }
    if (dayOfWeek) {
      where.dayOfWeek = dayOfWeek;
    }
    if (classId) {
      where.pengajianClassId = classId;
    }

    return this.prisma.pengajianSchedule.findMany({
      where,
      include: {
        pengajianClass: true,
        teacher: {
          select: {
            id: true,
            teacherCode: true,
            fullName: true,
            subject: true,
            whatsappNumber: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ session: 'asc' }, { pengajianClass: { name: 'asc' } }],
    });
  }

  async createSchedule(dto: CreatePengajianScheduleDto) {
    const halaqah = await this.prisma.pengajianClass.findUnique({ where: { id: dto.pengajianClassId } });
    if (!halaqah) {
      throw new NotFoundException('Halaqah pengajian tidak ditemukan');
    }

    const teacher = await this.prisma.teacher.findUnique({ where: { id: dto.teacherId } });
    if (!teacher) {
      throw new NotFoundException('Ustadz / Guru pengampu tidak ditemukan');
    }

    return this.prisma.pengajianSchedule.create({
      data: {
        pengajianClassId: dto.pengajianClassId,
        teacherId: dto.teacherId,
        session: dto.session,
        dayOfWeek: dto.dayOfWeek,
        kitab: dto.kitab,
        timeSlot: dto.timeSlot || (dto.session === PengajianSession.PAGI ? '05:30 - 06:30' : dto.session === PengajianSession.ASHAR ? '16:00 - 17:00' : '18:30 - 19:45'),
        isActive: true,
      },
      include: {
        pengajianClass: true,
        teacher: true,
      },
    });
  }

  async deleteSchedule(id: string) {
    const schedule = await this.prisma.pengajianSchedule.findUnique({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Jadwal pengajian tidak ditemukan');
    }
    return this.prisma.pengajianSchedule.delete({ where: { id } });
  }

  // ==========================================
  // ABSENSI PENGAJIAN (PAGI, ASHAR, MAGHRIB)
  // ==========================================

  private getDayOfWeekFromDate(dateStr: string): DayOfWeek {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[day];
  }

  async getAttendanceForDateAndSession(dateStr: string, session?: PengajianSession) {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const dayOfWeek = this.getDayOfWeekFromDate(dateStr);

    const scheduleWhere: any = { isActive: true, dayOfWeek };
    if (session) {
      scheduleWhere.session = session;
    }

    const schedules = await this.prisma.pengajianSchedule.findMany({
      where: scheduleWhere,
      include: {
        pengajianClass: true,
        teacher: {
          select: {
            id: true,
            teacherCode: true,
            fullName: true,
            subject: true,
            whatsappNumber: true,
          },
        },
      },
      orderBy: [{ session: 'asc' }, { pengajianClass: { name: 'asc' } }],
    });

    const attendances = await this.prisma.pengajianAttendance.findMany({
      where: {
        attendanceDate: date,
        ...(session ? { session } : {}),
      },
      include: {
        recordedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    const attendanceMap = new Map<string, any>();
    for (const a of attendances) {
      attendanceMap.set(a.pengajianScheduleId, a);
    }

    return schedules.map((sched) => {
      const att = attendanceMap.get(sched.id);
      return {
        scheduleId: sched.id,
        session: sched.session,
        dayOfWeek: sched.dayOfWeek,
        timeSlot: sched.timeSlot,
        kitab: sched.kitab,
        halaqah: sched.pengajianClass,
        teacher: sched.teacher,
        attendance: att || null,
        status: att ? att.status : null,
        badalTeacherName: att ? att.badalTeacherName : null,
        notes: att ? att.notes : null,
        attachmentUrl: att ? att.attachmentUrl : null,
        attachmentType: att ? att.attachmentType : null,
        attachmentName: att ? att.attachmentName : null,
        recordedBy: att ? att.recordedBy : null,
      };
    });
  }

  async recordAttendance(dto: RecordPengajianAttendanceDto, userId: string) {
    const schedule = await this.prisma.pengajianSchedule.findUnique({
      where: { id: dto.pengajianScheduleId },
      include: { pengajianClass: true, teacher: true },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal pengajian tidak ditemukan');
    }

    if (
      (dto.status === AttendanceStatus.SICK || dto.status === AttendanceStatus.OFFICIAL_DUTY) &&
      !dto.attachmentUrl
    ) {
      throw new BadRequestException(
        `Status ${dto.status === AttendanceStatus.SICK ? 'Sakit' : 'Tugas Dinas / Badal'} wajib melampirkan surat keterangan (surat sakit/surat tugas) dalam format Gambar atau PDF.`,
      );
    }

    const date = new Date(dto.attendanceDate);
    date.setUTCHours(0, 0, 0, 0);

    return this.prisma.pengajianAttendance.upsert({
      where: {
        pengajianScheduleId_attendanceDate: {
          pengajianScheduleId: dto.pengajianScheduleId,
          attendanceDate: date,
        },
      },
      update: {
        session: dto.session,
        status: dto.status,
        badalTeacherId: dto.badalTeacherId,
        badalTeacherName: dto.badalTeacherName,
        notes: dto.notes,
        attachmentUrl: dto.attachmentUrl,
        attachmentType: dto.attachmentType,
        attachmentName: dto.attachmentName,
        recordedById: userId,
      },
      create: {
        pengajianScheduleId: dto.pengajianScheduleId,
        attendanceDate: date,
        session: dto.session,
        status: dto.status,
        badalTeacherId: dto.badalTeacherId,
        badalTeacherName: dto.badalTeacherName,
        notes: dto.notes,
        attachmentUrl: dto.attachmentUrl,
        attachmentType: dto.attachmentType,
        attachmentName: dto.attachmentName,
        recordedById: userId,
      },

      include: {
        schedule: {
          include: {
            pengajianClass: true,
            teacher: true,
          },
        },
      },
    });
  }

  // ==========================================
  // RINGKASAN HARI INI & DASHBOARD STATS
  // ==========================================

  async getTodaySummary(dateStr?: string) {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const records = await this.getAttendanceForDateAndSession(today);

    const sessions = {
      PAGI: records.filter((r) => r.session === PengajianSession.PAGI),
      ASHAR: records.filter((r) => r.session === PengajianSession.ASHAR),
      MAGHRIB: records.filter((r) => r.session === PengajianSession.MAGHRIB),
    };

    const countByStatus = (items: any[]) => {
      const present = items.filter((i) => i.status === AttendanceStatus.PRESENT).length;
      const sick = items.filter((i) => i.status === AttendanceStatus.SICK).length;
      const permission = items.filter((i) => i.status === AttendanceStatus.PERMISSION).length;
      const officialDuty = items.filter((i) => i.status === AttendanceStatus.OFFICIAL_DUTY).length;
      const unrecorded = items.filter((i) => !i.status).length;
      return { total: items.length, present, sick, permission, officialDuty, unrecorded };
    };

    return {
      date: today,
      summary: {
        PAGI: countByStatus(sessions.PAGI),
        ASHAR: countByStatus(sessions.ASHAR),
        MAGHRIB: countByStatus(sessions.MAGHRIB),
      },
      records,
    };
  }

  async getDashboardStats() {
    const [totalClasses, totalSchedules, todaySummary] = await Promise.all([
      this.prisma.pengajianClass.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.pengajianSchedule.count({ where: { isActive: true } }),
      this.getTodaySummary(),
    ]);

    const allTodayRecords = todaySummary.records;
    const totalToday = allTodayRecords.length;
    const totalPresent = allTodayRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const totalAbsent = allTodayRecords.filter((r) => r.status && r.status !== AttendanceStatus.PRESENT).length;
    const totalPending = allTodayRecords.filter((r) => !r.status).length;

    return {
      totalClasses,
      totalSchedules,
      today: {
        total: totalToday,
        present: totalPresent,
        absent: totalAbsent,
        pending: totalPending,
        attendanceRate: totalToday > 0 ? Math.round((totalPresent / (totalToday - totalPending || 1)) * 100) : 0,
      },
      sessions: todaySummary.summary,
    };
  }
}
