import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider';
import { CloudApiWhatsAppProvider } from './providers/cloud-api-whatsapp.provider';
import { WhatsAppStatus } from '@prisma/client';

describe('WhatsAppService Integration & Non-blocking Outbox Tests', () => {
  let prisma: PrismaService;
  let service: WhatsAppService;

  beforeAll(async () => {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;

    prisma = new PrismaService();
    await prisma.onModuleInit();

    const mockProvider = new MockWhatsAppProvider();
    const cloudProvider = new CloudApiWhatsAppProvider();

    service = new WhatsAppService(prisma, mockProvider, cloudProvider);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should send notification message via MockProvider and record SENT status in outbox', async () => {
    const teacher = await prisma.teacher.findFirst();
    expect(teacher).toBeDefined();

    if (teacher) {
      const log = await service.sendNotificationMessage(
        teacher.id,
        '08123456789',
        'Halo Guru, absensi mengajar Anda telah tercatat.',
      );

      expect(log).toBeDefined();
      expect(log.teacherId).toBe(teacher.id);

      const check = await prisma.whatsAppMessage.findUnique({
        where: { id: log.id },
      });
      expect(check?.status).toBe(WhatsAppStatus.SENT);
    }
  });

  it('should allow resending a message in outbox log', async () => {
    const log = await prisma.whatsAppMessage.findFirst();
    expect(log).toBeDefined();

    if (log) {
      const resendRes = await service.resendMessage(log.id);
      expect(resendRes.success).toBe(true);
      expect(resendRes.data.status).toBe(WhatsAppStatus.SENT);
    }
  });

  it('should verify webhook token correctly', () => {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'simogu_wa_verify_token_123';
    const challenge = service.verifyWebhookToken('subscribe', verifyToken, '11582014');
    expect(challenge).toBe('11582014');
  });
});
