import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private audit: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.code);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.audit.log({
      userId: user.id,
      companyId: user.companyId || undefined,
      action: 'LOGIN_SUCCESS',
      entityName: 'User',
      entityId: user.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleCode: user.role.code,
        companyId: user.companyId,
        forcePasswordChange: user.forcePasswordChange,
      },
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwt.verify(dto.refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const stored = await this.prisma.refreshToken.findUnique({
        where: { token: dto.refreshToken },
      });
      if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token inválido');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }
      const tokens = await this.generateTokens(user.id, user.email, user.role.code);
      await this.storeRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.audit.log({
      userId,
      action: 'LOGOUT',
      entityName: 'User',
      entityId: userId,
    });
    return { message: 'Sesión cerrada' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return { message: 'Si el correo existe, recibirás instrucciones' };
    }
    const token = this.jwt.sign(
      { sub: user.id, type: 'password-reset' },
      { secret: this.config.get('JWT_SECRET'), expiresIn: '1h' },
    );
    await this.mail.sendPasswordReset(user.email, token, user.companyId || undefined);
    await this.audit.log({
      userId: user.id,
      companyId: user.companyId || undefined,
      action: 'FORGOT_PASSWORD',
      entityName: 'User',
      entityId: user.id,
    });
    return { message: 'Si el correo existe, recibirás instrucciones' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwt.verify(dto.token, {
        secret: this.config.get('JWT_SECRET'),
      });
      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Token inválido');
      }
      const passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash, forcePasswordChange: false },
      });
      await this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } });
      await this.audit.log({
        userId: payload.sub,
        action: 'RESET_PASSWORD',
        entityName: 'User',
        entityId: payload.sub,
      });
      return { message: 'Contraseña actualizada correctamente' };
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('La nueva contraseña no puede ser igual a la anterior');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, forcePasswordChange: false },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    await this.audit.log({
      userId,
      action: 'CHANGE_PASSWORD',
      entityName: 'User',
      entityId: userId,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async generateTokens(userId: string, email: string, roleCode: string) {
    const payload = { sub: userId, email, roleCode };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION') || '15m',
    });
    const refreshToken = this.jwt.sign({ sub: userId }, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') || '7d',
    });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRATION') || '7d';
    const expiresAt = new Date(Date.now() + this.parseDuration(expiresIn));
    await this.prisma.refreshToken.upsert({
      where: { token },
      update: { expiresAt },
      create: { userId, token, expiresAt },
    });
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return value * (multipliers[unit] || multipliers.d);
  }
}
