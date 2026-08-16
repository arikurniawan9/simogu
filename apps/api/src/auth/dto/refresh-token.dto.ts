import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'd9f8a7b6c5e4...',
    description: 'Refresh token yang valid',
  })
  @IsNotEmpty({ message: 'Refresh token wajib diisi' })
  @IsString()
  refreshToken!: string;
}
