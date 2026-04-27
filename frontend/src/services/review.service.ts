import { api } from './api';
import type { Treatment } from './treatment.service';

interface PaginatedResponse<T> {
  data: T[];
}

export interface Observation {
  id: string;
  treatmentId: string;
  sectionCode: string;
  createdByUserId: string;
  creatorRole: string;
  message: string;
  status: string;
  createdAt: string;
}

export const reviewService = {
  getPendingTreatments: (params?: { companyId?: string }) =>
    api.get<Treatment[] | PaginatedResponse<Treatment>>('/treatments', { params: { ...params, status: 'enviado,en_revision_dpo,subsanado' } }).then(r => Array.isArray(r.data) ? r.data : r.data.data),
  getObservations: (treatmentId: string) =>
    api.get<Observation[]>(`/observations/treatment/${treatmentId}`).then(r => r.data),
  createObservation: (dto: { treatmentId: string; sectionCode: string; message: string }) =>
    api.post<Observation>('/observations', dto).then(r => r.data),
  resolveObservation: (id: string) =>
    api.patch<Observation>(`/observations/${id}/resolve`).then(r => r.data),
  approveTreatment: (id: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status: 'aprobado', comment }).then(r => r.data),
  observeTreatment: (id: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status: 'observado', comment }).then(r => r.data),
  returnTreatment: (id: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status: 'en_correccion', comment }).then(r => r.data),
  requestDpia: (id: string, comment?: string) =>
    api.post<Treatment>(`/treatments/${id}/status`, { status: 'requiere_eipd', comment }).then(r => r.data),
};
