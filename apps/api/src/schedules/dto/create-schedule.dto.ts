import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class CreateScheduleDto {
  @ApiProperty({ example: 'teacher_uuid_xxx', description: 'ID Guru' })
  @IsNotEmpty({ message: 'ID Guru wajib diisi' })
  @IsString()
  teacherId!: string;

  @ApiProperty({ example: 'class_uuid_xxx', description: 'ID Kelas' })
  @IsNotEmpty({ message: 'ID Kelas wajib diisi' })
  @IsString()
  classId!: string;

  @ApiProperty({ example: 'period_uuid_xxx', description: 'ID Jam Pelajaran' })
  @IsNotEmpty({ message: 'ID Jam Pelajaran wajib diisi' })
  @IsString()
  lessonPeriodId!: string;

  @ApiProperty({ example: 'semester_uuid_xxx', description: 'ID Semester' })
  @IsNotEmpty({ message: 'ID Semester wajib diisi' })
  @IsString()
  semesterId!: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Hari mengajar' })
  @IsEnum(DayOfWeek, { message: 'Hari mengajar harus berupa MONDAY..SUNDAY' })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: 'Matematika', description: 'Mata pelajaran' })
  @IsNotEmpty({ message: 'Mata pelajaran wajib diisi' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: '2026-01-05', description: 'Tanggal mulai berlaku' })
  @IsDateString()
  periodValidFrom!: string;

  @ApiProperty({ example: '2026-06-20', description: 'Tanggal selesai berlaku' })
  @IsDateString()
  periodValidTo!: string;
}
