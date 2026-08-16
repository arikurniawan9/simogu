import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class QueryScheduleDto {
  @ApiProperty({ required: false, description: 'Filter ID Guru' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false, description: 'Filter ID Kelas' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false, enum: DayOfWeek, description: 'Filter Hari' })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({ required: false, description: 'Filter ID Semester' })
  @IsOptional()
  @IsString()
  semesterId?: string;

  @ApiProperty({ required: false, description: 'Filter status aktif (true/false)' })
  @IsOptional()
  @IsString()
  isActive?: string;
}
