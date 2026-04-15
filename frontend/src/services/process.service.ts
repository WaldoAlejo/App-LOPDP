import { api } from './api';

export interface Process {
  id: string;
  companyId: string;
  areaId: string;
  name: string;
  subProcess?: string;
  description?: string;
  businessObjective?: string;
  responsibleUserId?: string;
  criticality?: string;
  isActive: boolean;
  company?: { id: string; legalName: string };
  area?: { id: string; name: string };
  createdAt: string;
}

export interface CreateProcessDto {
  companyId: string;
  areaId: string;
  name: string;
  subProcess?: string;
  description?: string;
  businessObjective?: string;
  responsibleUserId?: string;
  criticality?: string;
  isActive?: boolean;
}

export const processService = {
  getAll: (params?: { companyId?: string; areaId?: string }) =>
    api.get<Process[]>('/processes', { params }).then(r => r.data),
  getOne: (id: string) => api.get<Process>(`/processes/${id}`).then(r => r.data),
  create: (dto: CreateProcessDto) => api.post<Process>('/processes', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateProcessDto>) => api.patch<Process>(`/processes/${id}`, dto).then(r => r.data),
  toggleStatus: (id: string) => api.patch<Process>(`/processes/${id}/status`).then(r => r.data),
};
