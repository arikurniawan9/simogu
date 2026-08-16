import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan metrik ringkasan dashboard (Guru Aktif, Jadwal Hari Ini, Absensi Hari Ini)' })
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('charts')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan data grafik & statistik ketidakhadiran' })
  async getChartData() {
    return this.dashboardService.getChartData();
  }
}
