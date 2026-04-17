import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { AuditService } from '../../audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => key),
  };

  const mockMail = {
    sendPasswordReset: jest.fn(),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: MailService, useValue: mockMail },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password', 10);
      const user = {
        id: 'u1',
        email: 'test@test.com',
        passwordHash,
        isActive: true,
        firstName: 'Test',
        lastName: 'User',
        role: { code: 'DPO' },
        companyId: 'c1',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);
      mockPrisma.refreshToken.upsert.mockResolvedValue({});

      const result = await service.login({ email: 'test@test.com', password: 'password' });

      expect(result.user.email).toBe('test@test.com');
      expect(result.tokens.accessToken).toBe('token');
      expect(mockAudit.log).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'bad@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const user = { id: 'u1', email: 'test@test.com', passwordHash: await bcrypt.hash('other', 10), isActive: true, role: { code: 'DPO' } };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      await expect(service.login({ email: 'test@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh tokens and log audit', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.logout('u1');
      expect(result.message).toBe('Sesión cerrada');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOGOUT' }));
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email and audit log for existing user', async () => {
      const user = { id: 'u1', email: 'test@test.com', companyId: 'c1' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      const result = await service.forgotPassword({ email: 'test@test.com' });
      expect(mockMail.sendPasswordReset).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
      expect(result.message).toContain('Si el correo existe');
    });

    it('should return generic message for non-existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'none@test.com' });
      expect(mockMail.sendPasswordReset).not.toHaveBeenCalled();
      expect(result.message).toContain('Si el correo existe');
    });
  });

  describe('resetPassword', () => {
    it('should update password and clear tokens', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'u1', type: 'password-reset' });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({});

      const result = await service.resetPassword({ token: 'tok', newPassword: 'newpass' });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
      expect(result.message).toBe('Contraseña actualizada correctamente');
    });

    it('should throw BadRequestException on invalid token type', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'u1', type: 'other' });
      await expect(service.resetPassword({ token: 'tok', newPassword: 'newpass' })).rejects.toThrow(BadRequestException);
    });
  });
});
