import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ObservationsService } from '../observations.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ObservationsService', () => {
  let service: ObservationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    treatment: {
      findUnique: jest.fn(),
    },
    observation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObservationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ObservationsService>(ObservationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return observations by treatment', async () => {
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });
    mockPrisma.observation.findMany.mockResolvedValue([{ id: 'o1', message: 'Test' }]);
    const result = await service.findByTreatment('t1', { userId: 'u1', roleCode: 'PROCESS_LEADER', companyId: 'c1' });
    expect(result).toHaveLength(1);
  });

  it('should create observation', async () => {
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', currentStatus: 'en_revision_dpo', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });
    mockPrisma.observation.create.mockResolvedValue({ id: 'o1', message: 'Test' });
    const result = await service.create({ treatmentId: 't1', sectionCode: 'general', message: 'Test' } as any, { userId: 'u1', roleCode: 'DPO', companyId: 'c1' });
    expect(result.message).toBe('Test');
  });

  it('should reject observation creation outside review states', async () => {
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', currentStatus: 'borrador', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });
    await expect(
      service.create({ treatmentId: 't1', sectionCode: 'general', message: 'Test' } as any, { userId: 'u1', roleCode: 'DPO', companyId: 'c1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should resolve observation', async () => {
    mockPrisma.observation.findUnique.mockResolvedValue({ id: 'o1', status: 'abierta', treatmentId: 't1' });
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', currentStatus: 'en_correccion', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });
    mockPrisma.observation.update.mockResolvedValue({ id: 'o1', status: 'cerrada' });
    const result = await service.resolve('o1', { userId: 'u1', roleCode: 'PROCESS_LEADER', companyId: 'c1' });
    expect(result.status).toBe('cerrada');
  });

  it('should reject observation resolution outside correction state', async () => {
    mockPrisma.observation.findUnique.mockResolvedValue({ id: 'o1', status: 'abierta', treatmentId: 't1' });
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', currentStatus: 'en_revision_dpo', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });
    await expect(service.resolve('o1', { userId: 'u1', roleCode: 'PROCESS_LEADER', companyId: 'c1' })).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when resolving missing observation', async () => {
    mockPrisma.observation.findUnique.mockResolvedValue(null);
    await expect(service.resolve('o1', { userId: 'u1', roleCode: 'PROCESS_LEADER', companyId: 'c1' })).rejects.toThrow(NotFoundException);
  });

  it('should forbid auditor from creating observations', async () => {
    mockPrisma.treatment.findUnique.mockResolvedValue({ id: 't1', currentStatus: 'en_revision_dpo', companyId: 'c1', createdByUserId: 'u1', treatmentResponsibleUserId: 'u1', process: { responsibleUserId: 'u1' } });

    await expect(
      service.create({ treatmentId: 't1', sectionCode: 'general', message: 'Test' } as any, { userId: 'u1', roleCode: 'AUDITOR', companyId: 'c1' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
