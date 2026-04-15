import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;

  const mockPrisma = {
    audit: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an audit log', async () => {
    mockPrisma.audit.create.mockResolvedValue({ id: 'a1' });

    const result = await service.log({
      userId: 'u1',
      action: 'LOGIN_SUCCESS',
      entityName: 'User',
      entityId: 'u1',
    });

    expect(prisma.audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'LOGIN_SUCCESS', entityName: 'User' }),
      }),
    );
    expect(result.id).toBe('a1');
  });

  it('should return paginated audit logs', async () => {
    mockPrisma.audit.findMany.mockResolvedValue([{ id: 'a1', action: 'TEST' }]);
    mockPrisma.audit.count.mockResolvedValue(1);

    const result = await service.findMany({ skip: 0, take: 10 });

    expect(prisma.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
