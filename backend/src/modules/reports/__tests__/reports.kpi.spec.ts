import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReportsService - KPIs', () => {
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

  it('should return aggregated KPIs', async () => {
    mockPrisma.treatment.findMany.mockResolvedValue([
      {
        id: 't1',
        currentStatus: 'aprobado',
        riskLevel: 'bajo',
        highRiskFlag: false,
        requiresDpia: false,
        dpiaStatus: null,
        areaId: 'a1',
        area: { name: 'Tecnología' },
        observations: [],
        createdAt: new Date(),
      },
      {
        id: 't2',
        currentStatus: 'en_revision_dpo',
        riskLevel: 'alto',
        highRiskFlag: true,
        requiresDpia: true,
        dpiaStatus: 'pendiente',
        areaId: 'a1',
        area: { name: 'Tecnología' },
        observations: [{ status: 'abierta' }],
        createdAt: new Date(),
      },
    ]);

    const result = await service.getKpis('c1');

    expect(prisma.treatment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'c1' },
        include: { area: true, observations: true, riskAssessment: true },
      }),
    );

    expect(result.totalTreatments).toBe(2);
    expect(result.approvedTreatments).toBe(1);
    expect(result.underDpoReview).toBe(1);
    expect(result.highRiskTreatments).toBe(1);
    expect(result.requiresDpia).toBe(1);
    expect(result.dpiaPending).toBe(1);
    expect(result.withOpenObservations).toBe(1);
    expect(result.topAreas).toHaveLength(1);
    expect(result.topAreas[0].count).toBe(2);
    expect(result.recentActivity).toHaveLength(30);
  });

  it('should return zero values when no treatments exist', async () => {
    mockPrisma.treatment.findMany.mockResolvedValue([]);

    const result = await service.getKpis('c1');

    expect(result.totalTreatments).toBe(0);
    expect(result.pendingTreatments).toBe(0);
    expect(result.approvedTreatments).toBe(0);
    expect(result.highRiskTreatments).toBe(0);
    expect(result.topAreas).toHaveLength(0);
    expect(result.recentActivity).toHaveLength(30);
  });
});
