import { api } from './api';

export interface Area {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  responsibleUserId?: string;
  isActive: boolean;
  company?: { id: string; legalName: string };
  createdAt: string;
}

export interface CreateAreaDto {
  companyId: string;
  name: string;
  description?: string;
  responsibleUserId?: string;
  isActive?: boolean;
}

export const areaService = {
  getAll: (companyId?: string) => api.get<Area[]>('/areas', { params: { companyId } }).then(r => r.data),
  getOne: (id: string) => api.get<Area>(`/areas/${id}`).then(r => r.data),
  create: (dto: CreateAreaDto) => api.post<Area>('/areas', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateAreaDto>) => api.patch<Area>(`/areas/${id}`, dto).then(r => r.data),
  toggleStatus: (id: string) => api.patch<Area>(`/areas/${id}/status`).then(r => r.data),
};
