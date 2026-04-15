import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  isActive: boolean;
  role?: { id: string; code: string; name: string };
  company?: { id: string; legalName: string };
  area?: { id: string; name: string };
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  companyId?: string;
  areaId?: string;
  phone?: string;
  position?: string;
  isActive?: boolean;
}

export const userService = {
  getAll: (params?: Record<string, string>) => api.get<User[]>('/users', { params }).then(r => r.data),
  getOne: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  create: (dto: CreateUserDto) => api.post<User>('/users', dto).then(r => r.data),
  update: (id: string, dto: Partial<CreateUserDto>) => api.patch<User>(`/users/${id}`, dto).then(r => r.data),
  toggleStatus: (id: string) => api.patch<User>(`/users/${id}/status`).then(r => r.data),
};
