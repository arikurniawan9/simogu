import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiProperty({ example: true, required: false, description: 'Status aktif guru' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
