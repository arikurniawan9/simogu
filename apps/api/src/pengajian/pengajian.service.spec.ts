import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PengajianService } from './pengajian.service';
import { PengajianSession, AttendanceStatus } from '@prisma/client';

describe('PengajianService Unit Tests', () => {
  let service: PengajianService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      pengajianClass: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      pengajianSchedule: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      pengajianAttendance: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        count: vi.fn(),
      },
      teacher: {
        findUnique: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
      },
    };

    service = new PengajianService(mockPrisma as any);
  });

  describe('Classes & Halaqah Management', () => {
    it('should create a new halaqah class', async () => {
      const mockClass = {
        id: 'class-1',
        name: 'Halaqah Al-Jurumiyah A',
        category: 'Kitab Kuning',
        location: 'Masjid Lt. 1',
        isActive: true,
      };

      mockPrisma.pengajianClass.create.mockResolvedValue(mockClass);

      const result = await service.createClass({
        name: 'Halaqah Al-Jurumiyah A',
        category: 'Kitab Kuning',
        location: 'Masjid Lt. 1',
      });

      expect(mockPrisma.pengajianClass.create).toHaveBeenCalled();
      expect(result.id).toBe('class-1');
      expect(result.name).toBe('Halaqah Al-Jurumiyah A');
    });

    it('should retrieve list of halaqah classes', async () => {
      mockPrisma.pengajianClass.findMany.mockResolvedValue([
        { id: 'c1', name: 'Halaqah A', isActive: true },
        { id: 'c2', name: 'Halaqah B', isActive: true },
      ]);

      const list = await service.findAllClasses();
      expect(list.length).toBe(2);
      expect(list[0].name).toBe('Halaqah A');
    });
  });

  describe('Schedules Management for 3 Sessions', () => {
    it('should create a schedule for PAGI session', async () => {
      mockPrisma.pengajianClass.findUnique.mockResolvedValue({ id: 'class-1', name: 'Halaqah 1' });
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1', fullName: 'Ust. Ahmad' });

      const mockSchedule = {
        id: 'sch-1',
        pengajianClassId: 'class-1',
        teacherId: 'teacher-1',
        session: PengajianSession.PAGI,
        dayOfWeek: 'MONDAY',
        kitab: 'Al-Jurumiyah',
        timeSlot: '05:30 - 06:30',
        isActive: true,
      };

      mockPrisma.pengajianSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.createSchedule({
        pengajianClassId: 'class-1',
        teacherId: 'teacher-1',
        session: PengajianSession.PAGI,
        dayOfWeek: 'MONDAY',
        kitab: 'Al-Jurumiyah',
        timeSlot: '05:30 - 06:30',
      });

      expect(result.session).toBe(PengajianSession.PAGI);
      expect(result.kitab).toBe('Al-Jurumiyah');
    });

    it('should create a schedule for ASHAR and MAGHRIB sessions', async () => {
      mockPrisma.pengajianClass.findUnique.mockResolvedValue({ id: 'class-2', name: 'Halaqah 2' });
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-2', fullName: 'Ust. Budi' });

      mockPrisma.pengajianSchedule.create.mockResolvedValueOnce({
        id: 'sch-ashar',
        session: PengajianSession.ASHAR,
        kitab: 'Safinatun Najah',
      });

      const asharRes = await service.createSchedule({
        pengajianClassId: 'class-2',
        teacherId: 'teacher-2',
        session: PengajianSession.ASHAR,
        dayOfWeek: 'TUESDAY',
        kitab: 'Safinatun Najah',
      });

      expect(asharRes.session).toBe(PengajianSession.ASHAR);
    });
  });

  describe('Attendance Recording with Badal Support', () => {
    it('should record attendance with badal teacher info when ustadz is sick/absent', async () => {
      mockPrisma.pengajianSchedule.findUnique.mockResolvedValue({
        id: 'sch-1',
        pengajianClassId: 'class-1',
        teacherId: 'teacher-1',
        session: PengajianSession.MAGHRIB,
      });

      const mockSavedRecord = {
        id: 'att-1',
        pengajianScheduleId: 'sch-1',
        attendanceDate: new Date('2026-09-02T00:00:00.000Z'),
        session: PengajianSession.MAGHRIB,
        status: AttendanceStatus.OFFICIAL_DUTY,
        badalTeacherName: 'Ust. Zulkifli (Badal)',
        notes: 'Ustadz utama izin tugas dakwah',
      };

      mockPrisma.pengajianAttendance.upsert.mockResolvedValue(mockSavedRecord);

      const result = await service.recordAttendance(
        {
          pengajianScheduleId: 'sch-1',
          attendanceDate: '2026-09-02',
          session: PengajianSession.MAGHRIB,
          status: AttendanceStatus.OFFICIAL_DUTY,
          badalTeacherName: 'Ust. Zulkifli (Badal)',
          notes: 'Ustadz utama izin tugas dakwah',
        },
        'user-piket-1',
      );

      expect(mockPrisma.pengajianAttendance.upsert).toHaveBeenCalled();
      expect(result.badalTeacherName).toBe('Ust. Zulkifli (Badal)');
      expect(result.status).toBe(AttendanceStatus.OFFICIAL_DUTY);
    });
  });

  describe('Dashboard Metrics & Stats', () => {
    it('should calculate stats per session (PAGI, ASHAR, MAGHRIB)', async () => {
      mockPrisma.pengajianClass.count.mockResolvedValue(5);
      mockPrisma.pengajianSchedule.count.mockResolvedValue(15);

      mockPrisma.pengajianSchedule.findMany.mockResolvedValue([
        { id: 's1', session: PengajianSession.PAGI, pengajianClass: { name: 'Class 1' }, teacher: { fullName: 'Ust 1' } },
        { id: 's2', session: PengajianSession.PAGI, pengajianClass: { name: 'Class 2' }, teacher: { fullName: 'Ust 2' } },
        { id: 's3', session: PengajianSession.ASHAR, pengajianClass: { name: 'Class 3' }, teacher: { fullName: 'Ust 3' } },
        { id: 's4', session: PengajianSession.MAGHRIB, pengajianClass: { name: 'Class 4' }, teacher: { fullName: 'Ust 4' } },
      ]);

      mockPrisma.pengajianAttendance.findMany.mockResolvedValue([
        { pengajianScheduleId: 's1', session: PengajianSession.PAGI, status: AttendanceStatus.PRESENT },
        { pengajianScheduleId: 's2', session: PengajianSession.PAGI, status: AttendanceStatus.PRESENT },
        { pengajianScheduleId: 's3', session: PengajianSession.ASHAR, status: AttendanceStatus.PERMISSION },
        { pengajianScheduleId: 's4', session: PengajianSession.MAGHRIB, status: AttendanceStatus.SICK },
      ]);

      const stats = await service.getDashboardStats();

      expect(stats.totalClasses).toBe(5);
      expect(stats.totalSchedules).toBe(15);
      expect(stats.sessions.PAGI.total).toBe(2);
      expect(stats.sessions.PAGI.present).toBe(2);
      expect(stats.sessions.ASHAR.total).toBe(1);
      expect(stats.sessions.ASHAR.permission).toBe(1);
      expect(stats.sessions.MAGHRIB.total).toBe(1);
      expect(stats.sessions.MAGHRIB.sick).toBe(1);
    });
  });
});
