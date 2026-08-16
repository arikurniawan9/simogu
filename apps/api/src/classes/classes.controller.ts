import { Controller, Get, Post, Patch, Delete, Body, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Classes')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Public()
  @Get('export/excel')
  @ApiOperation({ summary: 'Ekspor data kelas ke file Excel (.xlsx)' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.classesService.exportToExcel();
    const filename = `Data_Kelas_SIMOGU_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Public()
  @Get('template/excel')
  @ApiOperation({ summary: 'Unduh template Excel import data kelas' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.classesService.getImportTemplate();
    const filename = `Template_Import_Kelas_SIMOGU.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('import/preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pratinjau data kelas yang akan di-impor & deteksi duplikat' })
  async previewImport(
    @Body() body: { rows: Array<{ name: string; grade: number | string }> },
  ) {
    return this.classesService.previewImport(body.rows || []);
  }

  @Post('import/excel')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Impor data kelas dari file Excel dengan opsi LEWATI atau TIMPA duplikat' })
  async importExcel(
    @Body()
    body: {
      rows: Array<{ name: string; grade: number | string }>;
      duplicateAction?: 'SKIP' | 'OVERWRITE';
    },
  ) {
    return this.classesService.importFromRows(body.rows || [], body.duplicateAction || 'SKIP');
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah kelas baru' })
  async create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar seluruh kelas' })
  async findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan detail kelas' })
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui data kelas' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateClassDto>) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus kelas (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
