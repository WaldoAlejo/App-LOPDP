import { api } from './api';

export const reportsService = {
  downloadRatMasterExcel: (companyId?: string) =>
    api.get('/reports/rat-master/excel', {
      params: { companyId },
      responseType: 'blob',
    }).then(r => r.data as Blob),

  downloadRatMasterPdf: (companyId?: string) =>
    api.get('/reports/rat-master/pdf', {
      params: { companyId },
      responseType: 'blob',
    }).then(r => r.data as Blob),
};
