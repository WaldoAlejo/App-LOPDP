import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn().mockImplementation(() => ({
      creator: '',
      created: null,
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
      }),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from('excel-buffer')),
      },
    })),
  };
});

jest.mock('puppeteer', () => {
  return {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setContent: jest.fn().mockResolvedValue(undefined),
        pdf: jest.fn().mockResolvedValue(Buffer.from('pdf-buffer')),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    }),
  };
});

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrisma = {
    treatment: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockTreatment = {
    id: 't1',
    companyId: 'c1',
    areaId: 'a1',
    processId: 'p1',
    code: 'TRT-001',
    name: 'Tratamiento Test',
    version: 1,
    currentStatus: 'aprobado',
    riskLevel: 'bajo',
    highRiskFlag: false,
    requiresDpia: false,
    mainPurpose: 'Finalidad principal',
    secondaryPurposes: null,
    originOfData: null,
    dataCollectionChannel: null,
    approximateVolume: null,
    processingFrequency: null,
    automatedProcessing: false,
    profiling: false,
    automatedDecisions: false,
    usesAi: false,
    largeScaleProcessing: false,
    internationalTransfer: false,
    submissionDate: null,
    approvalDate: null,
    company: { id: 'c1', legalName: 'Servientrega' },
    area: { id: 'a1', name: 'Tecnología' },
    process: { id: 'p1', name: 'Desarrollo' },
    dataSubjects: [],
    treatmentDataItems: [],
    treatmentLegalBases: [],
    treatmentThirdParties: [],
    internationalTransfers: [],
    treatmentRetention: null,
    treatmentSecurityMeasures: [],
    lifecyclePhases: [],
    riskAssessment: null,
    observations: [],
    statusHistory: [],
    versions: [],
  };

  describe('generateRatMasterExcel', () => {
    it('should generate an Excel buffer for a company', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([mockTreatment]);

      const result = await service.generateRatMasterExcel('c1');

      expect(prisma.treatment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1' },
          include: expect.any(Object),
          orderBy: { code: 'asc' },
        }),
      );
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('excel-buffer');
    });

    it('should return an empty Excel when no treatments exist', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([]);

      const result = await service.generateRatMasterExcel('c1');

      expect(prisma.treatment.findMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateRatMasterPdf', () => {
    it('should generate a PDF buffer for a company', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([mockTreatment]);

      const result = await service.generateRatMasterPdf('c1');

      expect(prisma.treatment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1' },
          include: expect.any(Object),
          orderBy: { code: 'asc' },
        }),
      );
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('pdf-buffer');
    });

    it('should return a PDF even when no treatments exist', async () => {
      mockPrisma.treatment.findMany.mockResolvedValue([]);

      const result = await service.generateRatMasterPdf('c1');

      expect(prisma.treatment.findMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
