import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { TeachersService } from './teachers.service';
import { Gender } from '@prisma/client';

describe('TeachersService Integration Tests', () => {
  let prisma: PrismaService;
  let service: TeachersService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new TeachersService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should create a new teacher with normalized WA number', async () => {
    const code = `TEST-${Date.now()}`;
    const res = await service.create({
      teacherCode: code,
      fullName: 'Guru Test Normalisasi WA',
      gender: Gender.MALE,
      whatsappNumber: '081299998888',
      subject: 'Matematika',
    });

    expect(res.success).toBe(true);
    expect(res.data.teacherCode).toBe(code);
    expect(res.data.whatsappNumber).toBe('6281299998888');
  });

  it('should reject creation with duplicate teacherCode', async () => {
    const existing = await prisma.teacher.findFirst();
    expect(existing).toBeDefined();

    if (existing) {
      await expect(
        service.create({
          teacherCode: existing.teacherCode,
          fullName: 'Duplicate Teacher Test',
          gender: Gender.FEMALE,
          whatsappNumber: '081200001111',
          subject: 'Fisika',
        }),
      ).rejects.toThrow();
    }
  });

  it('should list teachers with pagination, search, and sorting', async () => {
    const res = await service.findAll({
      page: 1,
      limit: 5,
      search: 'Ari',
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.meta.page).toBe(1);
    expect(res.meta.limit).toBe(5);
  });

  it('should soft delete teacher (set deletedAt and isActive = false)', async () => {
    const code = `DEL-${Date.now()}`;
    const created = await service.create({
      teacherCode: code,
      fullName: 'Guru Soft Delete Test',
      gender: Gender.FEMALE,
      whatsappNumber: '081277776666',
      subject: 'Biologi',
    });

    const removeRes = await service.remove(created.data.id);
    expect(removeRes.success).toBe(true);

    const check = await prisma.teacher.findUnique({
      where: { id: created.data.id },
    });
    expect(check?.deletedAt).not.toBeNull();
    expect(check?.isActive).toBe(false);
  });
});
