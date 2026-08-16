import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.usernameOrEmail },
          { email: dto.usernameOrEmail },
        ],
        deletedAt: null,
      },
    });

    if (!user) {
      await this.logAudit(null, 'LOGIN_FAILED', 'User', null, { usernameOrEmail: dto.usernameOrEmail }, ipAddress, userAgent);
      throw new UnauthorizedException('Username, email, atau password salah');
    }

    if (!user.isActive) {
      await this.logAudit(user.id, 'LOGIN_BLOCKED', 'User', user.id, { reason: 'Account inactive' }, ipAddress, userAgent);
      throw new UnauthorizedException('Akun Anda nonaktif. Silakan hubungi Administrator');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.logAudit(user.id, 'LOGIN_FAILED', 'User', user.id, { reason: 'Invalid password' }, ipAddress, userAgent);
      throw new UnauthorizedException('Username, email, atau password salah');
    }

    // Generate Tokens
    const tokens = await this.generateTokens(user.id, user.username, user.role, user.teacherId);

    // Audit Log Login Success
    await this.logAudit(user.id, 'LOGIN_SUCCESS', 'User', user.id, null, ipAddress, userAgent);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          teacherId: user.teacherId,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken || !storedToken.user || !storedToken.user.isActive) {
      throw new UnauthorizedException('Refresh token tidak valid atau telah kadaluarsa');
    }

    // Revoke old refresh token (Token Rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new token pair
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.username,
      storedToken.user.role,
      storedToken.user.teacherId,
    );

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash },
        data: { isRevoked: true },
      });
    }

    await this.logAudit(userId, 'LOGOUT', 'User', userId, null);

    return {
      success: true,
      message: 'Berhasil keluar dari sistem',
    };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    await this.logAudit(userId, 'LOGOUT_ALL_DEVICES', 'User', userId, null);

    return {
      success: true,
      message: 'Berhasil keluar dari seluruh perangkat',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        teacherId: true,
        isActive: true,
        createdAt: true,
        teacher: {
          select: {
            teacherCode: true,
            nip: true,
            gender: true,
            whatsappNumber: true,
            subject: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    return {
      success: true,
      data: user,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return positive response to avoid user enumeration
    if (user) {
      await this.logAudit(user.id, 'FORGOT_PASSWORD_REQUESTED', 'User', user.id, null);
    }

    return {
      success: true,
      message: 'Jika email terdaftar, instruksi pemulihan password telah dikirim.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Basic verification placeholder for reset token
    if (!dto.token) {
      throw new BadRequestException('Token pemulihan tidak valid');
    }

    return {
      success: true,
      message: 'Password berhasil diperbarui',
    };
  }

  private async generateTokens(userId: string, username: string, role: string, teacherId?: string | null) {
    const payload = { sub: userId, username, role, teacherId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Store hashed refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async logAudit(
    userId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          newValues: details ? JSON.parse(JSON.stringify(details)) : undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (e) {
      console.error('Failed to create audit log:', e);
    }
  }
}
