import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiProperty({ example: true, required: false, description: 'Status aktif jadwal' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
