import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TreatmentsService } from '../treatments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';

describe('TreatmentsService', () => {
  let service: TreatmentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    area: {
      findUnique: jest.fn(),
    },
    process: {
      findUnique: jest.fn(),
    },
    treatment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    observation: {
      count: jest.fn(),
    },
    riskAssessment: {
      update: jest.fn(),
    },
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
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
    code: 'RAT-TECN-LOGI-001',
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
  };

  describe('findAll', () => {
    it('should return treatments for company', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([baseTreatment]);
      const result = await service.findAll({ roleCode: 'DPO', companyId: 'c1' }, {});
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return treatment', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      const result = await service.findOne('t1', { roleCode: 'DPO', companyId: 'c1' });
      expect(result.id).toBe('t1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(null);
      await expect(service.findOne('t1', { roleCode: 'SUPER_ADMIN' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create treatment with nested RAT sections and log audit', async () => {
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', companyId: 'c1', name: 'Tecnologia' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', companyId: 'c1', areaId: 'a1', name: 'Logistica' });
      mockPrisma.treatment.findMany.mockResolvedValue([]);
      mockPrisma.treatment.create.mockResolvedValue(baseTreatment);
      mockPrisma.statusHistory.create.mockResolvedValue({});
      const dto = {
        companyId: 'c1',
        areaId: 'a1',
        processId: 'p1',
        name: 'Test',
        mainPurpose: 'Purpose',
        captureSystem: 'Formulario web',
        storageSystem: 'ERP corporativo',
        medium: 'Digital',
        technologies: 'React, NestJS',
        linkedDocuments: 'Procedimiento de registro',
        applications: 'Portal clientes',
        internationalTransfer: true,
        dataSubjects: [{ dataSubjectTypeId: 'dst1', approximateCount: '10' }],
        dataItems: [{ dataItemId: 'di1', isRequired: true, isOptional: false }],
        legalBases: [{ legalBasisId: 'lb1', isMainBasis: true, justification: 'Contrato' }],
        thirdParties: [
          {
            thirdPartyId: 'tp1',
            accessPurpose: 'Procesamiento logístico',
            accessedDataDescription: 'Identificación y contacto',
            involvedDataSubjects: 'Clientes',
            transferOutsideCountry: false,
          },
        ],
        internationalTransfers: [
          {
            countryId: 'co1',
            thirdPartyId: 'tp1',
            destinationName: 'Proveedor cloud',
            transferredDataDescription: 'Datos de contacto',
            purpose: 'Alojamiento',
            transferLegalBasis: 'Contrato',
            safeguards: 'Cláusulas y cifrado',
          },
        ],
        lifecycle: [
          {
            lifecyclePhaseId: 'lf1',
            activityDescription: 'Captura del dato',
            processedDataDescription: 'Datos de contacto',
            participants: 'Cliente y operador',
            mediumOrSupport: 'Digital',
            technologies: 'Portal clientes',
            linkedDocuments: 'Formulario web',
            securityMeasuresByPhase: 'Control de acceso',
            risksByPhase: 'Acceso no autorizado',
          },
        ],
        retention: {
          activeRetentionPeriod: '5 años',
          retentionCriteria: 'Contrato vigente',
          legalOrContractualBasis: 'Obligación legal',
          blockingApplies: true,
          anonymizationApplies: false,
          deletionApplies: true,
        },
        securityMeasures: [{ securityMeasureId: 'sm1', implemented: true, criticality: 'alta' }],
        riskAssessment: {
          usesSpecialCategories: false,
          involvesChildren: false,
          largeScale: false,
          systematicMonitoring: false,
          profiling: false,
          automatedDecisions: false,
          videoSurveillance: false,
          geolocation: false,
          biometricData: false,
          healthData: false,
          criminalData: false,
          crossBorderTransfer: false,
          potentialHighImpact: false,
        },
      } as any;
      const result = await service.create(dto, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });
      expect(result.id).toBe('t1');
      expect(mockPrisma.treatment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dataSubjects: {
              create: [
                {
                  dataSubjectTypeId: 'dst1',
                  approximateCount: '10',
                  sourceType: undefined,
                  relationshipWithCompany: undefined,
                  notes: undefined,
                },
              ],
            },
            treatmentDataItems: {
              create: [
                {
                  dataItemId: 'di1',
                  isRequired: true,
                  isOptional: false,
                  sourceDirectOrIndirect: undefined,
                  notes: undefined,
                },
              ],
            },
            treatmentLegalBases: {
              create: [{ legalBasisId: 'lb1', justification: 'Contrato', isMainBasis: true }],
            },
            treatmentThirdParties: {
              create: [
                {
                  thirdPartyId: 'tp1',
                  accessPurpose: 'Procesamiento logístico',
                  accessedDataDescription: 'Identificación y contacto',
                  involvedDataSubjects: 'Clientes',
                  transferOutsideCountry: false,
                  notes: undefined,
                },
              ],
            },
            internationalTransfers: {
              create: [
                {
                  countryId: 'co1',
                  thirdPartyId: 'tp1',
                  destinationName: 'Proveedor cloud',
                  transferredDataDescription: 'Datos de contacto',
                  purpose: 'Alojamiento',
                  transferLegalBasis: 'Contrato',
                  safeguards: 'Cláusulas y cifrado',
                  notes: undefined,
                },
              ],
            },
            lifecyclePhases: {
              create: [
                {
                  lifecyclePhaseId: 'lf1',
                  activityDescription: 'Captura del dato',
                  processedDataDescription: 'Datos de contacto',
                  participants: 'Cliente y operador',
                  mediumOrSupport: 'Digital',
                  technologies: 'Portal clientes',
                  linkedDocuments: 'Formulario web',
                  securityMeasuresByPhase: 'Control de acceso',
                  risksByPhase: 'Acceso no autorizado',
                  phaseOrder: 1,
                },
              ],
            },
            treatmentRetention: expect.any(Object),
            treatmentSecurityMeasures: {
              create: [
                {
                  securityMeasureId: 'sm1',
                  implemented: true,
                  evidence: undefined,
                  criticality: 'alta',
                  notes: undefined,
                },
              ],
            },
            riskAssessment: expect.any(Object),
            captureSystem: 'Formulario web',
            storageSystem: 'ERP corporativo',
            medium: 'Digital',
            technologies: 'React, NestJS',
            linkedDocuments: 'Procedimiento de registro',
            applications: 'Portal clientes',
            code: 'RAT-TECN-LOGI-001',
          }),
        }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TREATMENT_CREATED' }));
    });

    it('should return code preview based on area and process', async () => {
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', companyId: 'c1', name: 'Tecnologia' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', companyId: 'c1', areaId: 'a1', name: 'Logistica' });
      mockPrisma.treatment.findMany.mockResolvedValue([{ code: 'RAT-TECN-LOGI-001' }, { code: 'RAT-TECN-LOGI-002' }]);

      const result = await service.getCodePreview({ roleCode: 'DPO', userId: 'u1', companyId: 'c1' }, { areaId: 'a1', processId: 'p1' });

      expect(result).toEqual({
        code: 'RAT-TECN-LOGI-003',
        areaSegment: 'TECN',
        processSegment: 'LOGI',
        sequence: 3,
      });
    });
  });

  describe('update', () => {
    it('should update treatment and log audit', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({
        ...baseTreatment,
        internationalTransfer: false,
        medium: 'Digital',
        technologies: 'React',
        linkedDocuments: 'Manual',
        treatmentThirdParties: [],
        internationalTransfers: [],
        lifecyclePhases: [],
      });
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a1', companyId: 'c1', name: 'Tecnologia' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p1', companyId: 'c1', areaId: 'a1', name: 'Logistica' });
      mockPrisma.treatment.update.mockResolvedValue({ ...baseTreatment, name: 'Updated' });
      const result = await service.update(
        't1',
        {
          name: 'Updated',
          dataSubjects: [{ dataSubjectTypeId: 'dst1' }],
          dataItems: [{ dataItemId: 'di1', isRequired: true, isOptional: false }],
          legalBases: [{ legalBasisId: 'lb1', isMainBasis: true }],
          thirdParties: [],
          internationalTransfers: [],
          lifecycle: [
            {
              lifecyclePhaseId: 'lf1',
              activityDescription: 'Uso interno',
              technologies: 'React',
              mediumOrSupport: 'Digital',
              linkedDocuments: 'Manual',
            },
          ],
        } as any,
        { roleCode: 'DPO', userId: 'u1', companyId: 'c1' },
      );
      expect(result.name).toBe('Updated');
      expect(mockPrisma.treatment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dataSubjects: expect.objectContaining({ deleteMany: {} }),
            treatmentDataItems: expect.objectContaining({ deleteMany: {} }),
            treatmentLegalBases: expect.objectContaining({ deleteMany: {} }),
            lifecyclePhases: expect.objectContaining({ deleteMany: {} }),
          }),
        }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TREATMENT_UPDATED' }));
    });

    it('should regenerate code when area or process changes', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({
        ...baseTreatment,
        internationalTransfer: false,
        medium: 'Digital',
        technologies: 'React',
        linkedDocuments: 'Manual',
        treatmentThirdParties: [],
        internationalTransfers: [],
        lifecyclePhases: [],
      });
      mockPrisma.area.findUnique.mockResolvedValue({ id: 'a2', companyId: 'c1', name: 'Talento Humano' });
      mockPrisma.process.findUnique.mockResolvedValue({ id: 'p2', companyId: 'c1', areaId: 'a2', name: 'Nomina' });
      mockPrisma.treatment.findMany.mockResolvedValue([]);
      mockPrisma.treatment.update.mockResolvedValue({ ...baseTreatment, areaId: 'a2', processId: 'p2', code: 'RAT-TALE-NOMI-001' });

      const result = await service.update('t1', { areaId: 'a2', processId: 'p2', name: 'Nuevo nombre' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });

      expect(result.code).toBe('RAT-TALE-NOMI-001');
      expect(mockPrisma.treatment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: 'RAT-TALE-NOMI-001' }),
        }),
      );
    });

    it('should throw BadRequestException if status is not editable', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'aprobado' });
      await expect(service.update('t1', { name: 'X' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when phase 11 technologies do not match step 6 summary', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({
        ...baseTreatment,
        internationalTransfer: false,
        medium: '',
        technologies: '',
        linkedDocuments: '',
        treatmentThirdParties: [],
        internationalTransfers: [],
        lifecyclePhases: [],
      });

      await expect(
        service.update(
          't1',
          {
            lifecycle: [
              {
                lifecyclePhaseId: 'lf1',
                activityDescription: 'Captura',
                technologies: 'Portal clientes',
              },
            ],
          } as any,
          { roleCode: 'DPO', userId: 'u1', companyId: 'c1' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when automated decisions lack regulatory detail', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({
        ...baseTreatment,
        profiling: false,
        automatedDecisions: false,
        humanInterventionAvailable: false,
        usesAi: false,
        internationalTransfer: false,
        medium: '',
        technologies: '',
        linkedDocuments: '',
        treatmentThirdParties: [],
        internationalTransfers: [],
        lifecyclePhases: [],
      });

      await expect(
        service.update(
          't1',
          {
            automatedDecisions: true,
            automatedDecisionsDescription: 'Perfil de riesgo crediticio',
            automatedDecisionsLogic: '',
            automatedDecisionsConsequences: 'Posible rechazo automático',
            humanInterventionAvailable: false,
          } as any,
          { roleCode: 'DPO', userId: 'u1', companyId: 'c1' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changeStatus', () => {
    it('should change status to enviado and log audit', async () => {
      const treatment = {
        ...baseTreatment,
        currentStatus: 'borrador',
        dataSubjects: [{ id: 'ds1' }],
        treatmentDataItems: [{ id: 'di1' }],
        treatmentLegalBases: [{ id: 'lb1' }],
        treatmentRetention: { id: 'tr1' },
        treatmentSecurityMeasures: [{ id: 'sm1' }],
      };
      mockPrisma.treatment.findUnique
        .mockResolvedValueOnce(treatment)
        .mockResolvedValueOnce(treatment);
      mockPrisma.treatment.update.mockResolvedValue({ ...treatment, currentStatus: 'enviado' });
      mockPrisma.statusHistory.create.mockResolvedValue({});
      mockPrisma.observation.count.mockResolvedValue(0);

      const result = await service.changeStatus('t1', { status: 'enviado' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });
      expect(result.currentStatus).toBe('enviado');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TREATMENT_STATUS_CHANGED' }));
    });

    it('should throw BadRequestException on invalid transition', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      await expect(service.changeStatus('t1', { status: 'aprobado' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' })).rejects.toThrow(BadRequestException);
    });

    it('should allow approving a treatment from enviado when there are no open observations', async () => {
      const treatment = {
        ...baseTreatment,
        currentStatus: 'enviado',
        submissionDate: new Date(),
        approvalDate: null,
      };

      mockPrisma.treatment.findUnique
        .mockResolvedValueOnce(treatment)
        .mockResolvedValueOnce(treatment);
      mockPrisma.observation.count.mockResolvedValue(0);
      mockPrisma.treatment.update.mockResolvedValue({ ...treatment, currentStatus: 'aprobado' });
      mockPrisma.statusHistory.create.mockResolvedValue({});

      const result = await service.changeStatus('t1', { status: 'aprobado' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });

      expect(result.currentStatus).toBe('aprobado');
    });

    it('should throw BadRequestException when moving to observado without open observations', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'en_revision_dpo' });
      mockPrisma.observation.count.mockResolvedValue(0);

      await expect(
        service.changeStatus('t1', { status: 'observado' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when moving to subsanado with open observations', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'en_correccion' });
      mockPrisma.observation.count.mockResolvedValue(1);

      await expect(
        service.changeStatus('t1', { status: 'subsanado' } as any, { roleCode: 'PROCESS_LEADER', userId: 'u1', companyId: 'c1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow returning a subsanado treatment to en_correccion when there are open observations', async () => {
      const treatment = {
        ...baseTreatment,
        currentStatus: 'subsanado',
      };

      mockPrisma.treatment.findUnique.mockResolvedValue(treatment);
      mockPrisma.observation.count.mockResolvedValue(1);
      mockPrisma.treatment.update.mockResolvedValue({ ...treatment, currentStatus: 'en_correccion' });
      mockPrisma.statusHistory.create.mockResolvedValue({});

      const result = await service.changeStatus('t1', { status: 'en_correccion' } as any, { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });

      expect(result.currentStatus).toBe('en_correccion');
    });

    it('should forbid auditor from approving treatments', async () => {
      const treatment = {
        ...baseTreatment,
        currentStatus: 'en_revision_dpo',
      };

      mockPrisma.treatment.findUnique.mockResolvedValue(treatment);

      await expect(
        service.changeStatus('t1', { status: 'aprobado' } as any, { roleCode: 'AUDITOR', userId: 'u1', companyId: 'c1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete treatment and log audit', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue(baseTreatment);
      mockPrisma.treatment.delete.mockResolvedValue({});
      const result = await service.delete('t1', { roleCode: 'DPO', userId: 'u1', companyId: 'c1' });
      expect(result.message).toBe('Tratamiento eliminado');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TREATMENT_DELETED' }));
    });

    it('should throw BadRequestException if not borrador', async () => {
      mockPrisma.treatment.findUnique.mockResolvedValue({ ...baseTreatment, currentStatus: 'enviado' });
      await expect(service.delete('t1', { roleCode: 'DPO', userId: 'u1', companyId: 'c1' })).rejects.toThrow(BadRequestException);
    });
  });
});
