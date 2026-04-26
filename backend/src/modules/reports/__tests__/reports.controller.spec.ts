import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ReportsController } from '../reports.controller';
import { ReportsService } from '../reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    generateRatMasterExcel: jest.fn(),
    generateRatMasterPdf: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.setHeader = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadRatMasterExcel', () => {
    it('should download Excel for SUPER_ADMIN with provided companyId', async () => {
      const buffer = Buffer.from('excel');
      mockReportsService.generateRatMasterExcel.mockResolvedValue(buffer);
      const res = mockResponse();
      const user = { roleCode: 'SUPER_ADMIN' as const, companyId: 'c1', userId: 'u1' };

      await controller.downloadRatMasterExcel('c2', user, res);

      expect(service.generateRatMasterExcel).toHaveBeenCalledWith(user, 'c2');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="RAT_Maestro.xlsx"');
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    it('should download Excel for non-admin using their own companyId', async () => {
      const buffer = Buffer.from('excel');
      mockReportsService.generateRatMasterExcel.mockResolvedValue(buffer);
      const res = mockResponse();
      const user = { roleCode: 'DPO' as const, companyId: 'c1', userId: 'u1' };

      await controller.downloadRatMasterExcel('c2', user, res);

      expect(service.generateRatMasterExcel).toHaveBeenCalledWith(user, 'c2');
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
  });

  describe('downloadRatMasterPdf', () => {
    it('should download PDF for SUPER_ADMIN with provided companyId', async () => {
      const buffer = Buffer.from('pdf');
      mockReportsService.generateRatMasterPdf.mockResolvedValue(buffer);
      const res = mockResponse();
      const user = { roleCode: 'SUPER_ADMIN' as const, companyId: 'c1', userId: 'u1' };

      await controller.downloadRatMasterPdf('c2', user, res);

      expect(service.generateRatMasterPdf).toHaveBeenCalledWith(user, 'c2');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="RAT_Maestro.pdf"');
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    it('should download PDF for non-admin using their own companyId', async () => {
      const buffer = Buffer.from('pdf');
      mockReportsService.generateRatMasterPdf.mockResolvedValue(buffer);
      const res = mockResponse();
      const user = { roleCode: 'DPO' as const, companyId: 'c1', userId: 'u1' };

      await controller.downloadRatMasterPdf('c2', user, res);

      expect(service.generateRatMasterPdf).toHaveBeenCalledWith(user, 'c2');
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
  });
});
