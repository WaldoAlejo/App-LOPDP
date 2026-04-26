import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from '../audit.controller';
import { AuditService } from '../audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let service: AuditService;

  const mockAuditService = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockAuditService }],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return audit logs for SUPER_ADMIN without company filter', async () => {
    mockAuditService.findMany.mockResolvedValue({ data: [], total: 0 });
    const user = { userId: 'u1', roleCode: 'SUPER_ADMIN' as const, companyId: 'c1' };

    const result = await controller.findAll(user, undefined, undefined, undefined, undefined, undefined, '0', '20');

    expect(service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: undefined, skip: 0, take: 20 }),
    );
    expect(result).toEqual({ data: [], total: 0 });
  });

  it('should filter by companyId for non-super-admin', async () => {
    mockAuditService.findMany.mockResolvedValue({ data: [], total: 0 });
    const user = { userId: 'u1', roleCode: 'AUDITOR' as const, companyId: 'c1' };

    await controller.findAll(user);

    expect(service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'c1' }),
    );
  });
});
