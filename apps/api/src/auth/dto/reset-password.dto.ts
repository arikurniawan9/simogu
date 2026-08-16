import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset_token_xxx',
    description: 'Token reset password',
  })
  @IsNotEmpty({ message: 'Reset token wajib diisi' })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Password baru',
  })
  @IsNotEmpty({ message: 'Password baru tidak boleh kosong' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  newPassword!: string;
}
