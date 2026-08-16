import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateExcelReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate && endDate) {
      where.attendanceDate = {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        schedule: {
          include: {
            teacher: true,
            class: true,
            lessonPeriod: true,
          },
        },
        recordedBy: true,
      },
      orderBy: { attendanceDate: 'desc' },
    });

    const reportRows = records.map((r, idx) => ({
      No: idx + 1,
      Tanggal: r.attendanceDate.toISOString().split('T')[0],
      'Kode Guru': r.schedule.teacher.teacherCode,
      'Nama Guru': r.schedule.teacher.fullName,
      'Mata Pelajaran': r.schedule.subject,
      Kelas: r.schedule.class.name,
      'Jam Ke': r.schedule.lessonPeriod.periodNumber,
      'Waktu Jam': `${r.schedule.lessonPeriod.startTime} - ${r.schedule.lessonPeriod.endTime}`,
      'Status Absensi': r.status,
      Catatan: r.notes || '-',
      'Petugas Pencatat': r.recordedBy?.fullName || '-',
    }));

    // Create Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi Guru');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async getReportData(startDate?: string, endDate?: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      take: 100,
      include: {
        schedule: {
          include: {
            teacher: true,
            class: true,
            lessonPeriod: true,
          },
        },
      },
      orderBy: { attendanceDate: 'desc' },
    });

    return {
      success: true,
      data: records,
    };
  }
}
