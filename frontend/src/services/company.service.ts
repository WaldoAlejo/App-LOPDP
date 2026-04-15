import { api } from './api';

export interface Company {
  id: string;
  legalName: string;
  tradeName?: string;
  ruc: string;
  address?: string;
  email: string;
  phone?: string;
  economicActivity?: string;
  sector?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyDto {
  legalName: string;
  tradeName?: string;
  ruc: string;
  address?: string;
  email: string;
  phone?: string;
  economicActivity?: string;
  sector?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export const companyService = {
  getAll: () => api.get<Company[]>('/companies').then(r => r.data),
  getOne: (id: string) => api.get<Company>(`/companies/${id}`).then(r => r.data),
  create: (dto: CreateCompanyDto) => api.post<Company>('/companies', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateCompanyDto>) => api.patch<Company>(`/companies/${id}`, dto).then(r => r.data),
  toggleStatus: (id: string) => api.patch<Company>(`/companies/${id}/status`).then(r => r.data),
};
