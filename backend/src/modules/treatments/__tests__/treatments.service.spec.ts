import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TreatmentsService } from '../treatments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../../notifications/notification.service';
import {
  TreatmentCodeService,
  TreatmentValidationService,
  TreatmentStateMachineService,
  TreatmentRiskService,
  TreatmentAccessService,
  TreatmentCompletenessService,
} from '../services';

describe('TreatmentsService', () => {
  let service: TreatmentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    area: { findUnique: jest.fn() },
    process: { findUnique: jest.fn() },
    treatment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    statusHistory: { create: jest.fn() },
    observation: { count: jest.fn() },
    riskAssessment: { update: jest.fn() },
  };

  const mockAudit = { log: jest.fn() };
  const mockNotification = { notifyStatusChange: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentsService,
        TreatmentCodeService,
        TreatmentValidationService,
        TreatmentStateMachineService,
        TreatmentRiskService,
        TreatmentAccessService,
        TreatmentCompletenessService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<TreatmentsService>(TreatmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseTreatment = {
    id: 't1',
    companyId: 'c1',
    areaId: 'a1',
    processId: 'p1',
    code: 'RAT-TE-LO-001',
    createdByUserId: 'u1',
    treatmentResponsibleUserId: 'u1',
    process: { responsibleUserId: 'u1' },
    currentStatus: 'borrador',
    name: 'Test',
    mainPurpose: 'Purpose',
    dataSubjects: [],
    treatmentDataItems: [],
    treatmentLegalBases: [],
    treatmentRetention: null,
    treatmentSecurityMeasures: [],
    lifecyclePhases: [],
    treatmentThirdParties: [],
    internationalTransfers: [],
    riskAssessment: null,
    reviewedByUserId: null,
    submissionDate: null,
    approvalDate: null,
  };

  const mockUser = { userId: 'u1', email: 'test@test.com', roleCode: 'DPO' as const, companyId: 'c1' };
  const mockSuperAdmin = { userId: 'u1', email: 'test@test.com', roleCode: 'SUPER_ADMIN' as const };

  describe('findAll', () => {
    it('should return paginated treatments for company', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([baseTreatment]);
      mockPrisma.treatment.count.mockResolvedValue(1);
      const result = await service.findAll(mockUser, {});
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return treatment', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      const result = await service.findOne('t1', mockUser);
      expect(result.id).toBe('t1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('t1', mockSuperAdmin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create treatment with nested RAT sections and log audit', async () => {
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', companyId: 'c1', name: 'Tecnologia' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', companyId: 'c1', areaId: 'a1', name: 'Logistica' });
      mockPrisma.treatment.findMany.mockResolvedValue([]);
      mockPrisma.treatment.create.mockResolvedValue({ ...baseTreatment, id: 'new-id' });

      const result = await service.create({
        companyId: 'c1', areaId: 'a1', processId: 'p1',
        name: 'Test', mainPurpose: 'Purpose',
        dataSubjects: [], dataItems: [], legalBases: [],
        securityMeasures: [], thirdParties: [],
        internationalTransfers: [], lifecycle: [],
      } as any, mockUser);

      expect(result.id).toBe('new-id');
      expect(mockPrisma.treatment.create).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update treatment in borrador', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', companyId: 'c1', name: 'Tecnologia' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', companyId: 'c1', areaId: 'a1', name: 'Logistica' });
      mockPrisma.treatment.findMany.mockResolvedValue([]);
      mockPrisma.treatment.update.mockResolvedValue({ ...baseTreatment, name: 'Updated' });

      const result = await service.update('t1', { name: 'Updated' } as any, mockUser);
      expect(result.name).toBe('Updated');
    });

    it('should throw if not editable status', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'aprobado' });
      await expect(service.update('t1', { name: 'Updated' } as any, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('changeStatus', () => {
    it('should change status from borrador to enviado', async () => {
      mockPrisma.treatment.findUnique
        .mockResolvedValueOnce(baseTreatment)
        .mockResolvedValueOnce({
          ...baseTreatment,
          dataSubjects: [{ id: 'ds1' }],
          treatmentDataItems: [{ id: 'di1' }],
          treatmentLegalBases: [{ id: 'lb1' }],
          treatmentRetention: { id: 'tr1' },
          treatmentSecurityMeasures: [{ id: 'sm1' }],
          lifecyclePhases: [],
          treatmentThirdParties: [],
          internationalTransfers: [],
        });
      mockPrisma.observation.count.mockResolvedValue(0);
      mockPrisma.treatment.update.mockResolvedValue({ ...baseTreatment, currentStatus: 'enviado' });
      mockPrisma.riskAssessment.update.mockResolvedValue({});

      const result = await service.changeStatus('t1', { status: 'enviado' } as any, mockUser);
      expect(result.currentStatus).toBe('enviado');
    });

    it('should throw for invalid transition', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      await expect(service.changeStatus('t1', { status: 'aprobado' } as any, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete treatment in borrador', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      mockPrisma.treatment.delete.mockResolvedValue({});
      const result = await service.delete('t1', mockUser);
      expect(result.message).toBe('Tratamiento eliminado');
    });

    it('should throw if not borrador', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'aprobado' });
      await expect(service.delete('t1', mockUser)).rejects.toThrow(BadRequestException);
    });
  });
});
