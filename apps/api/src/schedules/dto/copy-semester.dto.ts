import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CopySemesterScheduleDto {
  @ApiProperty({ example: 'semester_source_id', description: 'ID Semester asal (sumber jadwal)' })
  @IsNotEmpty({ message: 'ID Semester asal wajib diisi' })
  @IsString()
  sourceSemesterId!: string;

  @ApiProperty({ example: 'semester_target_id', description: 'ID Semester tujuan' })
  @IsNotEmpty({ message: 'ID Semester tujuan wajib diisi' })
  @IsString()
  targetSemesterId!: string;
}
