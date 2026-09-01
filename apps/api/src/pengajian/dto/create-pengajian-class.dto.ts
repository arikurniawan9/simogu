import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePengajianClassDto {
  @ApiProperty({ example: 'Halaqah Al-Jurumiyah (Nahwu A)', description: 'Nama halaqah / kelas pengajian' })
  @IsNotEmpty({ message: 'Nama halaqah wajib diisi' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Kitab Kuning', description: 'Kategori (Kitab Kuning, Tahfidz, Diniyah, Sorogan)' })
  @IsNotEmpty({ message: 'Kategori halaqah wajib diisi' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'Masjid Utama Lt. 1', required: false, description: 'Lokasi pengajian / halaqah' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'Kajian dasar nahwu shorof', required: false, description: 'Keterangan halaqah' })
  @IsOptional()
  @IsString()
  description?: string;
}
