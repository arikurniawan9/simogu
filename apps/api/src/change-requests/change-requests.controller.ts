import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ChangeRequestsService } from './change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
import { QueryChangeRequestDto } from './dto/query-change-request.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Change Requests')
@Controller('change-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChangeRequestsController {
  constructor(private readonly changeRequestsService: ChangeRequestsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET, Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pengajuan perubahan status absensi' })
  @SwaggerResponse({ status: 201, description: 'Pengajuan berhasil dikirim' })
  async create(
    @Body() dto: CreateChangeRequestDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.changeRequestsService.create(dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan daftar pengajuan perubahan status (dengan filter PENDING, APPROVED, REJECTED)' })
  async findAll(@Query() query: QueryChangeRequestDto) {
    return this.changeRequestsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.PIKET)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan detail pengajuan perubahan status' })
  async findOne(@Param('id') id: string) {
    return this.changeRequestsService.findOne(id);
  }

  @Post(':id/approve')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setujui pengajuan perubahan status absensi (Approval transaksional DB)' })
  @SwaggerResponse({ status: 200, description: 'Persetujuan berhasil dan status absensi ter-update' })
  @SwaggerResponse({ status: 403, description: 'Pengaju tidak dapat menyetujui pengajuannya sendiri' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewChangeRequestDto,
  ) {
    return this.changeRequestsService.approve(id, reviewerId, dto);
  }

  @Post(':id/reject')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tolak pengajuan perubahan status absensi' })
  @SwaggerResponse({ status: 200, description: 'Pengajuan berhasil ditolak' })
  async reject(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewChangeRequestDto,
  ) {
    return this.changeRequestsService.reject(id, reviewerId, dto);
  }
}
