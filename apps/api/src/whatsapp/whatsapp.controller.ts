import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role, WhatsAppStatus } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('logs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan log outbox pengiriman WhatsApp' })
  async getLogs(
    @Query('status') status?: WhatsAppStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.whatsappService.findAllLogs(status, page ? Number(page) : 1, limit ? Number(limit) : 10);
  }

  @Post('resend/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Coba kirim ulang pesan WhatsApp yang gagal (Retry Outbox)' })
  async resend(@Param('id') id: string) {
    return this.whatsappService.resendMessage(id);
  }

  @Public()
  @Get('webhook')
  @ApiOperation({ summary: 'Verifikasi Webhook WhatsApp Business Cloud API Meta' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const result = this.whatsappService.verifyWebhookToken(mode, token, challenge);
    if (result) {
      return Number(result) || result;
    }
    throw new ForbiddenException('Verifikasi Webhook token gagal');
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menerima callback status pengiriman dari Meta Webhook' })
  async receiveWebhook(@Body() body: any) {
    return { status: 'received' };
  }
}
