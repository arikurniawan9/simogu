import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; startDate: Date; endDate: Date }) {
    const item = await this.prisma.academicYear.create({ data });
    return { success: true, data: item };
  }

  async findAll() {
    const items = await this.prisma.academicYear.findMany({
      include: { semesters: true },
      orderBy: { startDate: 'desc' },
    });
    return { success: true, data: items };
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tahun ajaran tidak ditemukan');

    const updated = await this.prisma.academicYear.update({ where: { id }, data });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const existing = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tahun ajaran tidak ditemukan');

    await this.prisma.academicYear.delete({ where: { id } });
    return { success: true, message: 'Tahun ajaran berhasil dihapus' };
  }
}
