import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewChangeRequestDto {
  @ApiProperty({ example: 'Bukti surat tugas telah diverifikasi sah', required: false, description: 'Catatan peninjau admin' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
