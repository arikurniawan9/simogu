import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService & DB Constraint Tests', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should verify database connection', () => {
    expect(prisma).toBeDefined();
  });

  it('should enforce unique constraint on User.username', async () => {
    const existingUser = await prisma.user.findFirst();
    expect(existingUser).toBeDefined();

    if (existingUser) {
      await expect(
        prisma.user.create({
          data: {
            username: existingUser.username,
            passwordHash: 'hashed_dummy',
            fullName: 'Duplicate User Test',
            role: 'PIKET',
          },
        }),
      ).rejects.toThrow();
    }
  });

  it('should enforce unique constraint on Teacher.teacherCode', async () => {
    const existingTeacher = await prisma.teacher.findFirst();
    expect(existingTeacher).toBeDefined();

    if (existingTeacher) {
      await expect(
        prisma.teacher.create({
          data: {
            teacherCode: existingTeacher.teacherCode,
            fullName: 'Duplicate Teacher Test',
            gender: 'MALE',
            whatsappNumber: '628999999999',
            subject: 'Matematika',
          },
        }),
      ).rejects.toThrow();
    }
  });

  it('should verify seeded master data count', async () => {
    const userCount = await prisma.user.count();
    const teacherCount = await prisma.teacher.count();
    const classCount = await prisma.class.count();
    const scheduleCount = await prisma.schedule.count();

    expect(userCount).toBeGreaterThanOrEqual(4);
    expect(teacherCount).toBeGreaterThanOrEqual(10);
    expect(classCount).toBe(6);
    expect(scheduleCount).toBeGreaterThan(0);
  });
});
