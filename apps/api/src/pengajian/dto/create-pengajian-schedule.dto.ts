import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DayOfWeek, PengajianSession } from '@prisma/client';

export class CreatePengajianScheduleDto {
  @ApiProperty({ example: 'uuid_halaqah_1', description: 'ID Halaqah Pengajian' })
  @IsNotEmpty({ message: 'Halaqah pengajian wajib dipilih' })
  @IsString()
  pengajianClassId!: string;

  @ApiProperty({ example: 'uuid_ustadz_1', description: 'ID Ustadz / Guru Pengampu' })
  @IsNotEmpty({ message: 'Ustadz / Guru pengampu wajib dipilih' })
  @IsString()
  teacherId!: string;

  @ApiProperty({ enum: PengajianSession, example: PengajianSession.PAGI, description: 'Sesi waktu pengajian (PAGI, ASHAR, MAGHRIB)' })
  @IsEnum(PengajianSession, { message: 'Sesi waktu pengajian harus bernilai PAGI, ASHAR, atau MAGHRIB' })
  session!: PengajianSession;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Hari pengajian' })
  @IsEnum(DayOfWeek, { message: 'Hari pengajian tidak valid' })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: 'Kitab Jurumiyah', description: 'Nama kitab / materi' })
  @IsNotEmpty({ message: 'Nama kitab / materi wajib diisi' })
  @IsString()
  kitab!: string;

  @ApiProperty({ example: '05:30 - 06:30 (Ba\'da Subuh)', required: false, description: 'Rentang jam pengajian' })
  @IsOptional()
  @IsString()
  timeSlot?: string;
}
