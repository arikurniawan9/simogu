import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService & Seed Login Integration Tests', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();

    jwtService = new JwtService({
      secret: 'test_jwt_secret',
      signOptions: { expiresIn: '15m' },
    });

    authService = new AuthService(prisma, jwtService);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('should allow SuperAdmin seed account to login', async () => {
    const res = await authService.login({
      usernameOrEmail: 'superadmin',
      password: 'password123',
    });

    expect(res.success).toBe(true);
    expect(res.data.user.role).toBe('SUPER_ADMIN');
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
  });

  it('should allow Admin seed account to login', async () => {
    const res = await authService.login({
      usernameOrEmail: 'admin',
      password: 'password123',
    });

    expect(res.success).toBe(true);
    expect(res.data.user.role).toBe('ADMIN');
    expect(res.data.accessToken).toBeDefined();
  });

  it('should allow Piket seed account to login', async () => {
    const res = await authService.login({
      usernameOrEmail: 'piket1',
      password: 'password123',
    });

    expect(res.success).toBe(true);
    expect(res.data.user.role).toBe('PIKET');
  });

  it('should reject login with wrong password and record AuditLog', async () => {
    await expect(
      authService.login({
        usernameOrEmail: 'admin',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow();

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'LOGIN_FAILED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
  });

  it('should rotate refresh token successfully', async () => {
    const loginRes = await authService.login({
      usernameOrEmail: 'piket2',
      password: 'password123',
    });

    const refreshRes = await authService.refreshToken({
      refreshToken: loginRes.data.refreshToken,
    });

    expect(refreshRes.success).toBe(true);
    expect(refreshRes.data.accessToken).toBeDefined();
    expect(refreshRes.data.refreshToken).toBeDefined();
    expect(refreshRes.data.refreshToken).not.toBe(loginRes.data.refreshToken);
  });

  it('should fetch user profile', async () => {
    const user = await prisma.user.findFirst({ where: { username: 'admin' } });
    expect(user).toBeDefined();

    if (user) {
      const profile = await authService.getProfile(user.id);
      expect(profile.success).toBe(true);
      expect(profile.data.username).toBe('admin');
    }
  });
});
