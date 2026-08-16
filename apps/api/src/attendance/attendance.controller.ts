import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Catat absensi guru (tunggal atau massal / bulk)' })
  @SwaggerResponse({ status: 201, description: 'Absensi berhasil dicatat' })
  @SwaggerResponse({ status: 409, description: 'Absensi untuk jadwal & tanggal ini sudah dicatat sebelumnya' })
  async createAttendance(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.attendanceService.createAttendance(dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar riwayat absensi guru (dengan filter)' })
  async findAll(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('today-summary')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan ringkasan absensi hari ini (Hadir, Sakit, Izin, Pending Konfirmasi)' })
  async getTodaySummary(@Query('date') date?: string) {
    return this.attendanceService.getTodaySummary(date);
  }
}
