import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulesService } from './schedules.service';
import { DayOfWeek } from '@prisma/client';

describe('SchedulesService Integration & Conflict Tests', () => {
  let prisma: PrismaService;
  let service: SchedulesService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new SchedulesService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should fetch today active schedules', async () => {
    const res = await service.getTodaySchedules();
    expect(res.success).toBe(true);
    expect(res.data.dayOfWeek).toBeDefined();
    expect(Array.isArray(res.data.schedules)).toBe(true);
  });

  it('should reject schedule creation if teacher has a conflict', async () => {
    const existing = await prisma.schedule.findFirst({
      where: { isActive: true },
    });
    expect(existing).toBeDefined();

    if (existing) {
      // Find a different class ID
      const anotherClass = await prisma.class.findFirst({
        where: { id: { not: existing.classId } },
      });

      if (anotherClass) {
        // Attempt to schedule the SAME teacher at the SAME period and day in another class
        await expect(
          service.create({
            teacherId: existing.teacherId,
            classId: anotherClass.id,
            lessonPeriodId: existing.lessonPeriodId,
            semesterId: existing.semesterId,
            dayOfWeek: existing.dayOfWeek,
            subject: 'Matematika Test',
            periodValidFrom: '2026-01-05',
            periodValidTo: '2026-06-20',
          }),
        ).rejects.toThrow(/Bentrokan Guru/);
      }
    }
  });

  it('should reject schedule creation if class has a conflict', async () => {
    const existing = await prisma.schedule.findFirst({
      where: { isActive: true },
    });
    expect(existing).toBeDefined();

    if (existing) {
      // Find a different teacher ID
      const anotherTeacher = await prisma.teacher.findFirst({
        where: { id: { not: existing.teacherId } },
      });

      if (anotherTeacher) {
        // Attempt to schedule another teacher in the SAME class at the SAME period and day
        await expect(
          service.create({
            teacherId: anotherTeacher.id,
            classId: existing.classId,
            lessonPeriodId: existing.lessonPeriodId,
            semesterId: existing.semesterId,
            dayOfWeek: existing.dayOfWeek,
            subject: 'Fisika Test',
            periodValidFrom: '2026-01-05',
            periodValidTo: '2026-06-20',
          }),
        ).rejects.toThrow(/Bentrokan/);
      }
    }
  });
});
