import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeRequestsService } from './change-requests.service';
import { AttendanceStatus, ChangeRequestStatus } from '@prisma/client';

describe('ChangeRequestsService Integration, Approval & Concurrency Tests', () => {
  let prisma: PrismaService;
  let service: ChangeRequestsService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new ChangeRequestsService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should submit change request, approve transactionally, and update attendance status', async () => {
    const piket = await prisma.user.findFirst({ where: { role: 'PIKET' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const schedule = await prisma.schedule.findFirst({ where: { isActive: true } });

    expect(piket).toBeDefined();
    expect(admin).toBeDefined();
    expect(schedule).toBeDefined();

    if (piket && admin && schedule) {
      const attendanceDate = new Date(`2026-11-01T00:00:00.000Z`);
      await prisma.attendanceRecord.deleteMany({
        where: { scheduleId: schedule.id, attendanceDate },
      });

      const record = await prisma.attendanceRecord.create({
        data: {
          scheduleId: schedule.id,
          attendanceDate,
          status: AttendanceStatus.ABSENT_PENDING_CONFIRMATION,
          recordedById: piket.id,
        },
      });

      const reqRes = await service.create(
        {
          attendanceRecordId: record.id,
          requestedStatus: AttendanceStatus.PERMISSION,
          reason: 'Guru mengirim surat izin sah',
        },
        piket.id,
      );

      expect(reqRes.success).toBe(true);
      expect(reqRes.data.status).toBe(ChangeRequestStatus.PENDING);

      const approveRes = await service.approve(reqRes.data.id, admin.id, {
        reviewNotes: 'Disetujui admin',
      });

      expect(approveRes.success).toBe(true);
      expect(approveRes.data.status).toBe(ChangeRequestStatus.APPROVED);

      const updatedRecord = await prisma.attendanceRecord.findUnique({
        where: { id: record.id },
      });
      expect(updatedRecord?.status).toBe(AttendanceStatus.PERMISSION);
    }
  });

  it('should prevent requester from approving their own request', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const schedule = await prisma.schedule.findFirst({ where: { isActive: true } });

    if (admin && schedule) {
      const attendanceDate = new Date(`2026-11-02T00:00:00.000Z`);
      await prisma.attendanceRecord.deleteMany({
        where: { scheduleId: schedule.id, attendanceDate },
      });

      const record = await prisma.attendanceRecord.create({
        data: {
          scheduleId: schedule.id,
          attendanceDate,
          status: AttendanceStatus.ABSENT_PENDING_CONFIRMATION,
          recordedById: admin.id,
        },
      });

      const reqRes = await service.create(
        {
          attendanceRecordId: record.id,
          requestedStatus: AttendanceStatus.SICK,
          reason: 'Self approval test',
        },
        admin.id,
      );

      await expect(
        service.approve(reqRes.data.id, admin.id),
      ).rejects.toThrow(/tidak dapat menyetujui/);
    }
  });

  it('should prevent re-processing a completed request', async () => {
    const piket = await prisma.user.findFirst({ where: { role: 'PIKET' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const schedule = await prisma.schedule.findFirst({ where: { isActive: true } });

    if (piket && admin && schedule) {
      const attendanceDate = new Date(`2026-11-03T00:00:00.000Z`);
      await prisma.attendanceRecord.deleteMany({
        where: { scheduleId: schedule.id, attendanceDate },
      });

      const record = await prisma.attendanceRecord.create({
        data: {
          scheduleId: schedule.id,
          attendanceDate,
          status: AttendanceStatus.ABSENT_PENDING_CONFIRMATION,
          recordedById: piket.id,
        },
      });

      const reqRes = await service.create(
        {
          attendanceRecordId: record.id,
          requestedStatus: AttendanceStatus.OFFICIAL_DUTY,
          reason: 'Double processing test',
        },
        piket.id,
      );

      await service.approve(reqRes.data.id, admin.id);

      await expect(
        service.approve(reqRes.data.id, admin.id),
      ).rejects.toThrow(/telah diproses sebelumnya/);
    }
  });
});
