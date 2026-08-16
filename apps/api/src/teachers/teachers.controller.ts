import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Public()
  @Get('export/excel')
  @ApiOperation({ summary: 'Ekspor data guru ke file Excel (.xlsx)' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.teachersService.exportToExcel();
    const filename = `Data_Guru_SIMOGU_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Public()
  @Get('template/excel')
  @ApiOperation({ summary: 'Unduh template Excel import data guru' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.teachersService.getImportTemplate();
    const filename = `Template_Import_Guru_SIMOGU.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('import/preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pratinjau data guru yang akan di-impor & deteksi duplikat' })
  async previewImport(
    @Body() body: { rows: Array<{ teacherCode: string; fullName: string; subject: string; whatsappNumber: string }> },
  ) {
    return this.teachersService.previewImport(body.rows || []);
  }

  @Post('import/excel')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Impor data guru dari file Excel dengan opsi LEWATI atau TIMPA duplikat' })
  async importExcel(
    @Body()
    body: {
      rows: Array<{ teacherCode: string; fullName: string; subject: string; whatsappNumber: string }>;
      duplicateAction?: 'SKIP' | 'OVERWRITE';
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.teachersService.importFromRows(body.rows || [], body.duplicateAction || 'SKIP', userId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah data guru baru' })
  @SwaggerResponse({ status: 201, description: 'Guru berhasil ditambahkan' })
  async create(@Body() dto: CreateTeacherDto, @CurrentUser('id') userId: string) {
    return this.teachersService.create(dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar guru (dengan paginasi, pencarian, filter, dan sorting)' })
  async findAll(@Query() query: QueryTeacherDto) {
    return this.teachersService.findAll(query);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Pencarian cepat guru untuk portal publik / piket' })
  async searchPublic(@Query('q') q: string) {
    return this.teachersService.searchPublic(q);
  }

  @Public()
  @Get('public/summary/:code')
  @ApiOperation({ summary: 'Ringkasan absensi guru publik (tanpa data sensitif / tanpa No. WA)' })
  async getPublicSummary(@Param('code') code: string) {
    return this.teachersService.getPublicTeacherSummary(code);
  }

  @Public()
  @Get('public/history/:code')
  @ApiOperation({ summary: 'Riwayat absensi guru publik (tanpa data sensitif / tanpa No. WA)' })
  async getPublicHistory(
    @Param('code') code: string,
    @Query('month') month?: string,
    @Query('status') status?: string,
  ) {
    return this.teachersService.getPublicTeacherHistory(code, month, status);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan detail guru berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui data guru' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.teachersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus/nonaktifkan guru (soft delete)' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.teachersService.remove(id, userId);
  }
}
