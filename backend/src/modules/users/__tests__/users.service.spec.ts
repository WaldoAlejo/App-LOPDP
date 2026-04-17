import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  const baseUser = {
    id: 'u1',
    email: 'a@a.com',
    companyId: 'c1',
    isActive: true,
    role: { code: 'DPO' },
    company: { id: 'c1' },
    area: null,
  };

  describe('findAll', () => {
    it('should return users for a company', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ ...baseUser, firstName: 'A', lastName: 'B' }]);
      const result = await service.findAll({ roleCode: 'DPO', companyId: 'c1' }, { companyId: 'c1' });
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('a@a.com');
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      const result = await service.findOne('u1', { roleCode: 'DPO', companyId: 'c1' });
      expect(result.id).toBe('u1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('u1', { roleCode: 'SUPER_ADMIN' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different company', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', companyId: 'c2' });
      await expect(service.findOne('u1', { roleCode: 'DPO', companyId: 'c1' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create a user and audit log', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@a.com', roleId: 'r1', companyId: 'c1' });
      const result = await service.create(
        { email: 'a@a.com', password: 'pass', firstName: 'A', lastName: 'B', roleId: 'r1', companyId: 'c1' } as any,
        { roleCode: 'COMPANY_ADMIN', userId: 'u2', companyId: 'c1' },
      );
      expect(result.id).toBe('u1');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'USER_CREATED' }));
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.create({ email: 'a@a.com', password: 'pass', firstName: 'A', lastName: 'B', roleId: 'r1' } as any, {
          roleCode: 'SUPER_ADMIN',
          userId: 'u2',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a user and audit log', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
      const result = await service.update('u1', { firstName: 'New' } as any, { roleCode: 'DPO', companyId: 'c1', userId: 'u2' });
      expect(result.id).toBe('u1');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'USER_UPDATED' }));
    });
  });

  describe('toggleStatus', () => {
    it('should toggle user status and audit log', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });
      const result = await service.toggleStatus('u1', { roleCode: 'DPO', companyId: 'c1', userId: 'u2' });
      expect(result.isActive).toBe(false);
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'USER_STATUS_TOGGLED' }));
    });
  });
});
