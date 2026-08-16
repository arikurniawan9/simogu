import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateTeacherDto {
  @ApiProperty({ example: 'GRU-011', description: 'Kode unik guru' })
  @IsNotEmpty({ message: 'Kode guru wajib diisi' })
  @IsString()
  teacherCode!: string;

  @ApiProperty({ example: '198501012010011001', required: false, description: 'NIP guru (opsional)' })
  @IsOptional()
  @IsString()
  nip?: string;

  @ApiProperty({ example: 'Bambang Sudirjo, S.Pd.', description: 'Nama lengkap guru' })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  fullName!: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Jenis kelamin' })
  @IsEnum(Gender, { message: 'Jenis kelamin harus MALE atau FEMALE' })
  gender!: Gender;

  @ApiProperty({ example: '081234567890', description: 'Nomor WhatsApp' })
  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi' })
  @IsString()
  whatsappNumber!: string;

  @ApiProperty({ example: 'Matematika', description: 'Mata pelajaran utama' })
  @IsNotEmpty({ message: 'Mata pelajaran wajib diisi' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: 'https://storage.simogu.sch.id/photos/guru1.jpg', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
