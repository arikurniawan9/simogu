import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'X IPA 3', description: 'Nama kelas' })
  @IsNotEmpty({ message: 'Nama kelas wajib diisi' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '10', description: 'Tingkat kelas' })
  @IsNotEmpty({ message: 'Tingkat kelas wajib diisi' })
  @IsString()
  grade!: string;

  @ApiProperty({ example: 'IPA', required: false, description: 'Jurusan' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiProperty({ example: 'teacher_uuid_xxx', required: false, description: 'ID Wali Kelas' })
  @IsOptional()
  @IsString()
  homeroomTeacherId?: string;
}
