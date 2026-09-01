import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role, PengajianSession, DayOfWeek } from '@prisma/client';
import { PengajianService } from './pengajian.service';
import { CreatePengajianClassDto } from './dto/create-pengajian-class.dto';
import { CreatePengajianScheduleDto } from './dto/create-pengajian-schedule.dto';
import { RecordPengajianAttendanceDto } from './dto/record-pengajian-attendance.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Pengajian Pesantren')
@Controller('pengajian')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PengajianController {
  constructor(private readonly pengajianService: PengajianService) {}

  // ==========================================
  // PUBLIC / LANDING PAGE SUMMARY
  // ==========================================

  @Public()
  @Get('attendance/today-summary')
  @ApiOperation({ summary: 'Ringkasan presensi pengajian hari ini untuk portal publik & landing page' })
  @ApiQuery({ name: 'date', required: false, description: 'Tanggal YYYY-MM-DD (default hari ini)' })
  async getTodaySummary(@Query('date') date?: string) {
    const data = await this.pengajianService.getTodaySummary(date);
    return { success: true, data };
  }

  @Public()
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Statistik dashboard pengajian' })
  async getDashboardStats() {
    const data = await this.pengajianService.getDashboardStats();
    return { success: true, data };
  }

  // ==========================================
  // HALAQAH / KELAS PENGAJIAN
  // ==========================================

  @Public()
  @Get('classes')
  @ApiOperation({ summary: 'Daftar semua halaqah / kelas pengajian' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter kategori (Kitab Kuning, Tahfidz, dll)' })
  async findAllClasses(@Query('search') search?: string, @Query('category') category?: string) {
    const data = await this.pengajianService.findAllClasses(search, category);
    return { success: true, data };
  }

  @Post('classes')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.KETUA_PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Tambah halaqah / kelas pengajian baru' })
  async createClass(@Body() dto: CreatePengajianClassDto) {
    const data = await this.pengajianService.createClass(dto);
    return { success: true, message: 'Halaqah pengajian berhasil dibuat', data };
  }

  @Put('classes/:id')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.KETUA_PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Perbarui halaqah / kelas pengajian' })
  async updateClass(@Param('id') id: string, @Body() dto: Partial<CreatePengajianClassDto>) {
    const data = await this.pengajianService.updateClass(id, dto);
    return { success: true, message: 'Halaqah pengajian berhasil diperbarui', data };
  }

  @Delete('classes/:id')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.KETUA_PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Hapus halaqah / kelas pengajian' })
  async deleteClass(@Param('id') id: string) {
    await this.pengajianService.deleteClass(id);
    return { success: true, message: 'Halaqah pengajian berhasil dihapus' };
  }

  // ==========================================
  // JADWAL PENGAJIAN
  // ==========================================

  @Public()
  @Get('schedules')
  @ApiOperation({ summary: 'Daftar jadwal pengajian' })
  @ApiQuery({ name: 'session', enum: PengajianSession, required: false })
  @ApiQuery({ name: 'dayOfWeek', enum: DayOfWeek, required: false })
  @ApiQuery({ name: 'classId', required: false })
  async findAllSchedules(
    @Query('session') session?: PengajianSession,
    @Query('dayOfWeek') dayOfWeek?: DayOfWeek,
    @Query('classId') classId?: string,
  ) {
    const data = await this.pengajianService.findAllSchedules(session, dayOfWeek, classId);
    return { success: true, data };
  }

  @Post('schedules')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.KETUA_PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Buat jadwal pengajian baru' })
  async createSchedule(@Body() dto: CreatePengajianScheduleDto) {
    const data = await this.pengajianService.createSchedule(dto);
    return { success: true, message: 'Jadwal pengajian berhasil dibuat', data };
  }

  @Delete('schedules/:id')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.KETUA_PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Hapus jadwal pengajian' })
  async deleteSchedule(@Param('id') id: string) {
    await this.pengajianService.deleteSchedule(id);
    return { success: true, message: 'Jadwal pengajian berhasil dihapus' };
  }

  // ==========================================
  // ABSENSI PENGAJIAN (PAGI, ASHAR, MAGHRIB)
  // ==========================================

  @Get('attendance')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.PIKET, Role.KETUA_PIKET_PENGAJIAN, Role.PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Daftar absensi pengajian per tanggal & sesi' })
  @ApiQuery({ name: 'date', required: true, description: 'Format YYYY-MM-DD' })
  @ApiQuery({ name: 'session', enum: PengajianSession, required: false })
  async getAttendance(
    @Query('date') date: string,
    @Query('session') session?: PengajianSession,
  ) {
    const data = await this.pengajianService.getAttendanceForDateAndSession(date, session);
    return { success: true, data };
  }

  @Post('attendance')
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.KETUA_PIKET, Role.PIKET, Role.KETUA_PIKET_PENGAJIAN, Role.PIKET_PENGAJIAN)
  @ApiOperation({ summary: 'Catat absensi pengajian untuk jadwal tertentu' })
  async recordAttendance(
    @Body() dto: RecordPengajianAttendanceDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.pengajianService.recordAttendance(dto, userId || 'system-user');
    return { success: true, message: 'Presensi pengajian berhasil dicatat', data };
  }
}
