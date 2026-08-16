import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService Integration Tests', () => {
  let prisma: PrismaService;
  let service: DashboardService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new DashboardService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should fetch high-level dashboard metrics', async () => {
    const metrics = await service.getMetrics();
    expect(metrics.success).toBe(true);
    expect(metrics.data.activeTeachers).toBeGreaterThanOrEqual(0);
    expect(metrics.data.todaySchedules).toBeGreaterThanOrEqual(0);
  });

  it('should fetch chart data and status distribution', async () => {
    const charts = await service.getChartData();
    expect(charts.success).toBe(true);
    expect(charts.data.statusDistribution).toBeDefined();
  });
});
