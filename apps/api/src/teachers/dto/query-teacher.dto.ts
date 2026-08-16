import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTeacherDto {
  @ApiProperty({ required: false, example: '1', description: 'Halaman paginasi (default: 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: '10', description: 'Jumlah data per halaman (default: 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, example: 'Ari', description: 'Kata kunci pencarian (nama atau kode)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'true', description: 'Filter status aktif (true/false)' })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiProperty({ required: false, example: 'fullName', description: 'Field pengurutan (teacherCode, fullName, createdAt)' })
  @IsOptional()
  @IsIn(['teacherCode', 'fullName', 'createdAt'])
  sortBy?: string = 'fullName';

  @ApiProperty({ required: false, example: 'asc', description: 'Arah pengurutan (asc / desc)' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
