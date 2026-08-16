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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { CopySemesterScheduleDto } from './dto/copy-semester.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Public()
  @Get('export/excel')
  @ApiOperation({ summary: 'Ekspor jadwal mengajar ke file Excel (.xlsx)' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.schedulesService.exportToExcel();
    const filename = `Jadwal_Mengajar_SIMOGU_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Public()
  @Get('template/excel')
  @ApiOperation({ summary: 'Unduh template Excel import jadwal mengajar' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.schedulesService.getImportTemplate();
    const filename = `Template_Import_Jadwal_SIMOGU.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Post('import/preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pratinjau data jadwal yang akan di-impor & deteksi bentrokan' })
  async previewImport(
    @Body()
    body: {
      rows: Array<{
        dayOfWeek: any;
        teacherCode: string;
        className: string;
        periodNumber: number;
        subject: string;
      }>;
    },
  ) {
    return this.schedulesService.previewImport(body.rows || []);
  }

  @Post('import/excel')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Impor jadwal mengajar dari file Excel dengan opsi LEWATI atau TIMPA bentrokan' })
  async importExcel(
    @Body()
    body: {
      rows: Array<{
        dayOfWeek: any;
        teacherCode: string;
        className: string;
        periodNumber: number;
        subject: string;
      }>;
      conflictAction?: 'SKIP' | 'OVERWRITE';
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.schedulesService.importFromRows(body.rows || [], body.conflictAction || 'SKIP', userId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah jadwal mengajar baru dengan validasi bentrok' })
  @SwaggerResponse({ status: 201, description: 'Jadwal berhasil ditambahkan' })
  @SwaggerResponse({ status: 409, description: 'Bentrokan guru atau kelas detected' })
  async create(@Body() dto: CreateScheduleDto, @CurrentUser('id') userId: string) {
    return this.schedulesService.create(dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar jadwal mengajar (dengan filter guru, kelas, hari, semester)' })
  async findAll(@Query() query: QueryScheduleDto) {
    return this.schedulesService.findAll(query);
  }

  @Get('today')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan jadwal mengajar hari ini' })
  async getTodaySchedules() {
    return this.schedulesService.getTodaySchedules();
  }

  @Post('copy-semester')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Salin seluruh jadwal dari semester sebelumnya ke semester baru' })
  async copySemesterSchedules(
    @Body() dto: CopySemesterScheduleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.schedulesService.copySemesterSchedules(dto, userId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan detail jadwal mengajar' })
  async findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui jadwal mengajar' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.schedulesService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus jadwal mengajar' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.schedulesService.remove(id, userId);
  }
}
