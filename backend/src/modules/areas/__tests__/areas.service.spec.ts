import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AreasService } from '../areas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AreasService', () => {
  let service: AreasService;
  let prisma: PrismaService;

  const mockPrisma = {
    area: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AreasService>(AreasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return areas', async () => {
    mockPrisma.area.findMany.mockResolvedValue([{ id: 'a1', name: 'Tecnología' }]);
    const result = await service.findAll('c1');
    expect(result).toHaveLength(1);
  });

  it('should return one area', async () => {
    mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', name: 'Tecnología' });
    const result = await service.findOne('a1');
    expect(result.id).toBe('a1');
  });

  it('should throw NotFoundException', async () => {
    mockPrisma.area.findUnique.mockResolvedValue(null);
    await expect(service.findOne('a1')).rejects.toThrow(NotFoundException);
  });

  it('should create area', async () => {
    mockPrisma.area.create.mockResolvedValue({ id: 'a1', name: 'Tecnología' });
    const result = await service.create({ name: 'Tecnología', companyId: 'c1' } as any);
    expect(result.id).toBe('a1');
  });

  it('should toggle status', async () => {
    mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', isActive: true });
    mockPrisma.area.update.mockResolvedValue({ id: 'a1', isActive: false });
    const result = await service.toggleStatus('a1');
    expect(result.isActive).toBe(false);
  });
});
