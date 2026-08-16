import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LessonPeriodsService } from './lesson-periods.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Lesson Periods')
@Controller('lesson-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonPeriodsController {
  constructor(private readonly lessonPeriodsService: LessonPeriodsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah jam pelajaran baru' })
  async create(@Body() body: { periodNumber: number; startTime: string; endTime: string }) {
    return this.lessonPeriodsService.create(body);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar seluruh jam pelajaran' })
  async findAll() {
    return this.lessonPeriodsService.findAll();
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui jam pelajaran' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.lessonPeriodsService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus jam pelajaran' })
  async remove(@Param('id') id: string) {
    return this.lessonPeriodsService.remove(id);
  }
}
