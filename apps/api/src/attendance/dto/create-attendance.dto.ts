import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty({ example: ['schedule_uuid_1', 'schedule_uuid_2'], description: 'Daftar ID Jadwal Mengajar' })
  @IsArray()
  @IsNotEmpty({ message: 'Minimal 1 jadwal mengajar harus dipilih' })
  scheduleIds!: string[];

  @ApiProperty({ example: '2026-08-09', description: 'Tanggal absensi (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal absensi tidak valid (YYYY-MM-DD)' })
  attendanceDate!: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT, description: 'Status kehadiran' })
  @IsEnum(AttendanceStatus, { message: 'Status absensi tidak valid' })
  status!: AttendanceStatus;

  @ApiProperty({ example: 'Guru izin ada keperluan keluarga', required: false, description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '/api/v1/storage/files/surat_sakit.pdf', required: false, description: 'URL lampiran surat sakit atau surat tugas' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiProperty({ example: 'PDF', required: false, description: 'Tipe lampiran (IMAGE atau PDF)' })
  @IsOptional()
  @IsString()
  attachmentType?: string;

  @ApiProperty({ example: 'surat_tugas.pdf', required: false, description: 'Nama asli file lampiran' })
  @IsOptional()
  @IsString()
  attachmentName?: string;
}

