import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService Excel Export Integration Tests', () => {
  let prisma: PrismaService;
  let service: ReportsService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new ReportsService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should generate valid Excel binary buffer for attendance report', async () => {
    const buffer = await service.generateExcelReport();
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
