import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateChangeRequestDto {
  @ApiProperty({ example: 'attendance_record_uuid', description: 'ID Record Absensi' })
  @IsNotEmpty({ message: 'ID Record Absensi wajib diisi' })
  @IsString()
  attendanceRecordId!: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PERMISSION, description: 'Status usulan baru' })
  @IsEnum(AttendanceStatus, { message: 'Status usulan tidak valid' })
  requestedStatus!: AttendanceStatus;

  @ApiProperty({ example: 'Guru mengirimkan surat tugas dinas luar kota', description: 'Alasan perubahan status' })
  @IsNotEmpty({ message: 'Alasan perubahan wajib diisi' })
  @IsString()
  reason!: string;

  @ApiProperty({ example: 'https://storage.simogu.sch.id/surat-tugas.pdf', required: false, description: 'URL Lampiran bukti (opsional)' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
