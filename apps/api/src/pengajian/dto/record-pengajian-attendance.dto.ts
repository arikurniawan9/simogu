import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus, PengajianSession } from '@prisma/client';

export class RecordPengajianAttendanceDto {
  @ApiProperty({ example: 'uuid_pengajian_schedule_1', description: 'ID Jadwal Pengajian' })
  @IsNotEmpty({ message: 'Jadwal pengajian wajib dipilih' })
  @IsString()
  pengajianScheduleId!: string;

  @ApiProperty({ example: '2026-09-02', description: 'Tanggal pengajian (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal tidak valid (YYYY-MM-DD)' })
  attendanceDate!: string;

  @ApiProperty({ enum: PengajianSession, example: PengajianSession.PAGI, description: 'Sesi waktu pengajian (PAGI, ASHAR, MAGHRIB)' })
  @IsEnum(PengajianSession, { message: 'Sesi waktu harus PAGI, ASHAR, atau MAGHRIB' })
  session!: PengajianSession;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT, description: 'Status kehadiran ustadz' })
  @IsEnum(AttendanceStatus, { message: 'Status kehadiran tidak valid' })
  status!: AttendanceStatus;

  @ApiProperty({ example: 'uuid_ustadz_badal', required: false, description: 'ID Ustadz Badal / Pengganti' })
  @IsOptional()
  @IsString()
  badalTeacherId?: string;

  @ApiProperty({ example: 'Ust. Zulkifli (Badal luar)', required: false, description: 'Nama Ustadz Badal' })
  @IsOptional()
  @IsString()
  badalTeacherName?: string;

  @ApiProperty({ example: 'Izin menghadiri walimah', required: false, description: 'Keterangan tambahan' })
  @IsOptional()
  @IsString()
  notes?: string;
}
