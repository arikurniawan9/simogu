import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username atau Email terdaftar',
  })
  @IsNotEmpty({ message: 'Username atau Email tidak boleh kosong' })
  @IsString()
  usernameOrEmail!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Kata sandi akun',
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;
}
