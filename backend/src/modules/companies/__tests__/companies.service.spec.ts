import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: PrismaService;

  const mockPrisma = {
    company: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all companies', async () => {
    mockPrisma.company.findMany.mockResolvedValue([{ id: 'c1', legalName: 'Servientrega' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should return one company', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', legalName: 'Servientrega' });
    const result = await service.findOne('c1');
    expect(result.id).toBe('c1');
  });

  it('should throw NotFoundException', async () => {
    mockPrisma.company.findUnique.mockResolvedValue(null);
    await expect(service.findOne('c1')).rejects.toThrow(NotFoundException);
  });

  it('should create company', async () => {
    mockPrisma.company.findUnique.mockResolvedValue(null);
    mockPrisma.company.create.mockResolvedValue({ id: 'c1', ruc: '123' });
    const result = await service.create({ ruc: '123', legalName: 'Test', email: 'a@a.com' } as any);
    expect(result.id).toBe('c1');
  });

  it('should throw ConflictException on duplicate RUC', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1' });
    await expect(service.create({ ruc: '123' } as any)).rejects.toThrow(ConflictException);
  });

  it('should toggle status', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', isActive: true });
    mockPrisma.company.update.mockResolvedValue({ id: 'c1', isActive: false });
    const result = await service.toggleStatus('c1');
    expect(result.isActive).toBe(false);
  });
});
