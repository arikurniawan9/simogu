import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async exportToExcel() {
    const classes = await this.prisma.class.findMany({
      where: { deletedAt: null },
      include: { homeroomTeacher: true },
      orderBy: { name: 'asc' },
    });

    const rows = classes.map((c, idx) => ({
      No: idx + 1,
      'Nama Kelas': c.name,
      Tingkat: c.grade,
      'Wali Kelas': c.homeroomTeacher?.fullName || '-',
      Status: c.isActive ? 'AKTIF' : 'NON-AKTIF',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kelas');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getImportTemplate() {
    const sampleRows = [
      { 'Nama Kelas': 'X IPA 1', Tingkat: '10' },
      { 'Nama Kelas': 'XI IPS 2', Tingkat: '11' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Kelas');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async previewImport(rows: Array<{ name: string; grade: number | string }>) {
    const previewItems = [];
    let duplicateCount = 0;
    let newCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const className = (row.name || '').trim();

      const existing = className
        ? await this.prisma.class.findFirst({ where: { name: className, deletedAt: null } })
        : null;

      const isDuplicate = !!existing;
      if (isDuplicate) duplicateCount++;
      else newCount++;

      previewItems.push({
        rowNum,
        name: className,
        grade: row.grade,
        isDuplicate,
      });
    }

    return {
      success: true,
      data: {
        totalRows: rows.length,
        duplicateCount,
        newCount,
        previewItems,
      },
    };
  }

  async importFromRows(
    rows: Array<{ name: string; grade: number | string }>,
    duplicateAction: 'SKIP' | 'OVERWRITE' = 'SKIP',
  ) {
    const results = {
      successCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.name || !row.grade) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Nama Kelas dan Tingkat wajib diisi`);
        continue;
      }

      const existing = await this.prisma.class.findFirst({
        where: { name: row.name.trim(), deletedAt: null },
      });

      if (existing) {
        if (duplicateAction === 'SKIP') {
          results.skippedCount++;
          continue;
        } else if (duplicateAction === 'OVERWRITE') {
          try {
            await this.prisma.class.update({
              where: { id: existing.id },
              data: {
                grade: String(row.grade),
                isActive: true,
              },
            });
            results.updatedCount++;
          } catch (err: any) {
            results.errorCount++;
            results.errors.push(`Baris ${rowNum}: Gagal menimpa kelas - ${err.message}`);
          }
          continue;
        }
      }

      try {
        await this.prisma.class.create({
          data: {
            name: row.name.trim(),
            grade: String(row.grade),
            isActive: true,
          },
        });
        results.successCount++;
      } catch (err: any) {
        results.errorCount++;
        results.errors.push(`Baris ${rowNum}: Gagal menyimpan kelas - ${err.message}`);
      }
    }

    return {
      success: true,
      data: results,
    };
  }

  async create(dto: CreateClassDto) {
    const cls = await this.prisma.class.create({
      data: dto,
      include: { homeroomTeacher: true },
    });
    return { success: true, data: cls };
  }

  async findAll() {
    const items = await this.prisma.class.findMany({
      where: { deletedAt: null },
      include: { homeroomTeacher: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: items };
  }

  async findOne(id: string) {
    const item = await this.prisma.class.findFirst({
      where: { id, deletedAt: null },
      include: { homeroomTeacher: true },
    });
    if (!item) throw new NotFoundException('Kelas tidak ditemukan');
    return { success: true, data: item };
  }

  async update(id: string, dto: Partial<CreateClassDto>) {
    const existing = await this.prisma.class.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Kelas tidak ditemukan');

    const updated = await this.prisma.class.update({
      where: { id },
      data: dto,
      include: { homeroomTeacher: true },
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    const existing = await this.prisma.class.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Kelas tidak ditemukan');

    await this.prisma.class.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true, message: 'Kelas berhasil dinonaktifkan/dihapus' };
  }
}
