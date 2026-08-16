import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus } from '@prisma/client';

describe('AttendanceService Integration & Duplicate Prevention Tests', () => {
  let prisma: PrismaService;
  let service: AttendanceService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new AttendanceService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should record attendance for a valid schedule', async () => {
    const schedule = await prisma.schedule.findFirst({ where: { isActive: true } });
    expect(schedule).toBeDefined();

    if (schedule) {
      const dateStr = '2026-12-01';
      const dateObj = new Date(`${dateStr}T00:00:00.000Z`);

      await prisma.attendanceRecord.deleteMany({
        where: { scheduleId: schedule.id, attendanceDate: dateObj },
      });

      const res = await service.createAttendance({
        scheduleIds: [schedule.id],
        attendanceDate: dateStr,
        status: AttendanceStatus.PRESENT,
        notes: 'Piketter test',
      });

      expect(res.success).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].status).toBe(AttendanceStatus.PRESENT);
    }
  });

  it('should reject duplicate attendance recording for the same schedule and date', async () => {
    const schedule = await prisma.schedule.findFirst({ where: { isActive: true } });
    expect(schedule).toBeDefined();

    if (schedule) {
      const dateStr = '2026-12-02';
      const dateObj = new Date(`${dateStr}T00:00:00.000Z`);

      await prisma.attendanceRecord.deleteMany({
        where: { scheduleId: schedule.id, attendanceDate: dateObj },
      });

      // First recording
      await service.createAttendance({
        scheduleIds: [schedule.id],
        attendanceDate: dateStr,
        status: AttendanceStatus.ABSENT_PENDING_CONFIRMATION,
      });

      // Duplicate recording attempt
      await expect(
        service.createAttendance({
          scheduleIds: [schedule.id],
          attendanceDate: dateStr,
          status: AttendanceStatus.PRESENT,
        }),
      ).rejects.toThrow(/sudah dicatat sebelumnya/);
    }
  });

  it('should fetch today attendance summary', async () => {
    const summary = await service.getTodaySummary();
    expect(summary.success).toBe(true);
    expect(summary.data.present).toBeDefined();
    expect(summary.data.absentPending).toBeDefined();
  });
});
