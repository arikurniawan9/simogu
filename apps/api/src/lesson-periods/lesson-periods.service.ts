import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { periodNumber: number; startTime: string; endTime: string }) {
    const item = await this.prisma.lessonPeriod.create({ data });
    return { success: true, data: item };
  }

  async findAll() {
    const items = await this.prisma.lessonPeriod.findMany({
      orderBy: { periodNumber: 'asc' },
    });
    return { success: true, data: items };
  }

  async update(id: string, data: Partial<{ periodNumber: number; startTime: string; endTime: string; isActive: boolean }>) {
    const existing = await this.prisma.lessonPeriod.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Jam pelajaran tidak ditemukan');

    const updated = await this.prisma.lessonPeriod.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const existing = await this.prisma.lessonPeriod.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Jam pelajaran tidak ditemukan');

    await this.prisma.lessonPeriod.delete({ where: { id } });
    return { success: true, message: 'Jam pelajaran berhasil dihapus' };
  }
}
