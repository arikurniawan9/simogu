import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('data')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan data laporan absensi guru' })
  async getReportData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getReportData(startDate, endDate);
  }

  @Get('export/excel')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ekspor laporan absensi guru ke file Excel (.xlsx)' })
  async exportExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.generateExcelReport(startDate, endDate);
    const filename = `Laporan_Absensi_SIMOGU_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
