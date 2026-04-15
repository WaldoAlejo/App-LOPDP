import { api } from './api';

export type CatalogType =
  | 'data-subject-types'
  | 'data-categories'
  | 'data-items'
  | 'legal-bases'
  | 'third-party-types'
  | 'third-parties'
  | 'countries'
  | 'security-measures'
  | 'retention-rules'
  | 'lifecycle-phases'
  | 'risks';

export interface CatalogItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  companyId?: string;
  [key: string]: any;
}

export const catalogService = {
  getAll: (type: CatalogType, companyId?: string) =>
    api.get<CatalogItem[]>(`/catalogs/${type}`, { params: { companyId } }).then(r => r.data),
  getOne: (type: CatalogType, id: string) =>
    api.get<CatalogItem>(`/catalogs/${type}/${id}`).then(r => r.data),
  create: (type: CatalogType, dto: Partial<CatalogItem>) =>
    api.post<CatalogItem>(`/catalogs/${type}`, dto).then(r => r.data),
  update: (type: CatalogType, id: string, dto: Partial<CatalogItem>) =>
    api.patch<CatalogItem>(`/catalogs/${type}/${id}`, dto).then(r => r.data),
  toggleStatus: (type: CatalogType, id: string) =>
    api.patch<CatalogItem>(`/catalogs/${type}/${id}/status`).then(r => r.data),
};
