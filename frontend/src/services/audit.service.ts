import { api } from './api';

export interface AuditLog {
  id: string;
  userId?: string;
  companyId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValuesJson?: string;
  newValuesJson?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditQuery {
  userId?: string;
  entityName?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}

export const auditService = {
  getAll: (params: AuditQuery) =>
    api.get<{ data: AuditLog[]; total: number }>('/audits', { params }).then(r => r.data),
};
