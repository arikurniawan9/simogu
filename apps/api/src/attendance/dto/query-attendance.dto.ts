import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class QueryAttendanceDto {
  @ApiProperty({ required: false, example: '2026-08-09', description: 'Filter tanggal absensi' })
  @IsOptional()
  @IsString()
  attendanceDate?: string;

  @ApiProperty({ required: false, description: 'Filter ID Guru' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false, description: 'Filter ID Kelas' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false, enum: AttendanceStatus, description: 'Filter status kehadiran' })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
