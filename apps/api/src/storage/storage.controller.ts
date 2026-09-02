import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '../auth/decorators/public.decorator';


class UploadBase64Dto {
  fileBase64!: string;
  fileName!: string;
  mimeType?: string;
}

@ApiTags('Storage & Attachments')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Cek status konfigurasi penyimpanan (S3/MinIO vs Local Disk)' })
  getStatus() {
    return {
      success: true,
      data: this.storageService.getStorageStatus(),
    };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file lampiran surat tugas atau surat sakit (Multipart Form)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File gambar (JPG, PNG, WEBP) atau dokumen PDF (Maks 10MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file?: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File lampiran tidak ditemukan dalam request form data.');
    }

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname || 'document',
      file.mimetype || 'application/octet-stream',
    );

    return {
      success: true,
      message: 'File lampiran berhasil diupload.',
      data: result,
    };
  }

  @Post('upload-base64')
  @ApiOperation({ summary: 'Upload file lampiran via Base64 Data URI' })
  async uploadBase64(@Body() dto: UploadBase64Dto) {
    if (!dto.fileBase64 || !dto.fileName) {
      throw new BadRequestException('Parameter fileBase64 dan fileName wajib diisi.');
    }

    const result = await this.storageService.uploadBase64(
      dto.fileBase64,
      dto.fileName,
      dto.mimeType,
    );

    return {
      success: true,
      message: 'File lampiran berhasil diupload via base64.',
      data: result,
    };
  }

  @Get('files/:filename')
  @Public()
  @ApiOperation({ summary: 'Akses/download file lampiran yang tersimpan di server lokal' })
  async getLocalFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.storageService.getLocalFile(filename);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(file.buffer);
  }
}
