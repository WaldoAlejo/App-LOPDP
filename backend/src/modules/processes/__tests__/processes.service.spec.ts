import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProcessesService } from '../processes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProcessesService', () => {
  let service: ProcessesService;
  let prisma: PrismaService;

  const mockPrisma = {
    process: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProcessesService>(ProcessesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return processes', async () => {
    mockPrisma.process.findMany.mockResolvedValue([{ id: 'p1', name: 'Desarrollo' }]);
    const result = await service.findAll('c1', 'a1');
    expect(result).toHaveLength(1);
  });

  it('should return one process', async () => {
    mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', name: 'Desarrollo' });
    const result = await service.findOne('p1');
    expect(result.id).toBe('p1');
  });

  it('should throw NotFoundException', async () => {
    mockPrisma.process.findUnique.mockResolvedValue(null);
    await expect(service.findOne('p1')).rejects.toThrow(NotFoundException);
  });

  it('should create process', async () => {
    mockPrisma.process.create.mockResolvedValue({ id: 'p1', name: 'Desarrollo' });
    const result = await service.create({ name: 'Desarrollo', companyId: 'c1', areaId: 'a1' } as any);
    expect(result.id).toBe('p1');
  });

  it('should toggle status', async () => {
    mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', isActive: true });
    mockPrisma.process.update.mockResolvedValue({ id: 'p1', isActive: false });
    const result = await service.toggleStatus('p1');
    expect(result.isActive).toBe(false);
  });
});
