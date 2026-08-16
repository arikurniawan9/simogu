import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService Integration Tests', () => {
  let prisma: PrismaService;
  let service: NotificationsService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new NotificationsService(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should create notification and count unread notifications', async () => {
    const user = await prisma.user.findFirst();
    expect(user).toBeDefined();

    if (user) {
      const notif = await service.createNotification(
        user.id,
        'Pengajuan Perubahan Baru',
        'Piket mengajukan izin untuk Drs. Ari Kurniawan',
        'CHANGE_REQUEST',
      );

      expect(notif).toBeDefined();
      expect(notif.isRead).toBe(false);

      const unread = await service.getUnreadCount(user.id);
      expect(unread.data.unreadCount).toBeGreaterThanOrEqual(1);

      // Mark as read
      const markRes = await service.markAsRead(notif.id, user.id);
      expect(markRes.data.isRead).toBe(true);
    }
  });
});
