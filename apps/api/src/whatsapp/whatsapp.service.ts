import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider';
import { CloudApiWhatsAppProvider } from './providers/cloud-api-whatsapp.provider';
import { normalizeWhatsAppNumber } from '../common/utils/whatsapp-formatter.util';
import { WhatsAppStatus } from '@prisma/client';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private provider: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockWhatsAppProvider,
    private readonly cloudApiProvider: CloudApiWhatsAppProvider,
  ) {
    // Select provider based on ENV configuration
    if (
      process.env.NODE_ENV !== 'test' &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      !process.env.WHATSAPP_ACCESS_TOKEN.includes('your_access_token')
    ) {
      this.provider = this.cloudApiProvider;
      this.logger.log('WhatsApp Service initialized with WhatsApp Cloud API Provider');
    } else {
      this.provider = this.mockProvider;
      this.logger.log('WhatsApp Service initialized with Mock WhatsApp Provider');
    }
  }

  async sendNotificationMessage(
    teacherId: string,
    recipientPhone: string,
    messageBody: string,
    attendanceRecordId?: string,
  ) {
    const normalizedPhone = normalizeWhatsAppNumber(recipientPhone);

    // 1. Create DB log entry (PENDING)
    const log = await this.prisma.whatsAppMessage.create({
      data: {
        teacherId,
        attendanceRecordId: attendanceRecordId || null,
        recipientPhone: normalizedPhone,
        messageBody,
        status: WhatsAppStatus.PENDING,
      },
    });

    // 2. Non-blocking send execution
    try {
      const res = await this.provider.sendMessage(normalizedPhone, messageBody);

      if (res.success) {
        await this.prisma.whatsAppMessage.update({
          where: { id: log.id },
          data: {
            status: WhatsAppStatus.SENT,
            sentAt: new Date(),
          },
        });
      } else {
        await this.prisma.whatsAppMessage.update({
          where: { id: log.id },
          data: {
            status: WhatsAppStatus.FAILED,
            failureReason: res.error || 'Pesan gagal dikirim',
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`Non-blocking WhatsApp send error for ${log.id}:`, err);
      await this.prisma.whatsAppMessage.update({
        where: { id: log.id },
        data: {
          status: WhatsAppStatus.FAILED,
          failureReason: err.message || 'Kesalahan pengiriman',
        },
      });
    }

    return log;
  }

  async resendMessage(id: string) {
    const message = await this.prisma.whatsAppMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Pesan WhatsApp ID '${id}' tidak ditemukan`);
    }

    const res = await this.provider.sendMessage(message.recipientPhone, message.messageBody);

    const updated = await this.prisma.whatsAppMessage.update({
      where: { id },
      data: {
        status: res.success ? WhatsAppStatus.SENT : WhatsAppStatus.FAILED,
        sentAt: res.success ? new Date() : message.sentAt,
        failureReason: res.success ? null : res.error || 'Retry gagal',
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async findAllLogs(status?: WhatsAppStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: { select: { id: true, teacherCode: true, fullName: true, subject: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.whatsAppMessage.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  verifyWebhookToken(mode: string, token: string, challenge: string) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'simogu_wa_verify_token_123';
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }
}
