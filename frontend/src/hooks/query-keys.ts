/**
 * Standardized query keys for React Query.
 * Using a factory pattern prevents cache desynchronization and makes invalidation predictable.
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.users.all(), ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
 */

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    byCompany: (companyId: string) => ['users', 'company', companyId] as const,
  },

  // Companies
  companies: {
    all: () => ['companies'] as const,
    detail: (id: string) => ['companies', id] as const,
  },

  // Areas
  areas: {
    all: () => ['areas'] as const,
    byCompany: (companyId: string) => ['areas', 'company', companyId] as const,
    detail: (id: string) => ['areas', id] as const,
  },

  // Processes
  processes: {
    all: () => ['processes'] as const,
    byArea: (areaId: string) => ['processes', 'area', areaId] as const,
    detail: (id: string) => ['processes', id] as const,
  },

  // Treatments
  treatments: {
    all: () => ['treatments'] as const,
    list: (filters?: Record<string, unknown>) => ['treatments', 'list', filters ?? {}] as const,
    detail: (id: string) => ['treatments', id] as const,
    edit: (id: string) => ['treatments', 'edit', id] as const,
    observations: (id: string) => ['treatments', id, 'observations'] as const,
    codePreview: () => ['treatments', 'code-preview'] as const,
    risk: (id: string) => ['treatments', id, 'risk'] as const,
  },

  // Reviews
  reviews: {
    pending: () => ['reviews', 'pending'] as const,
    detail: (id: string) => ['reviews', id] as const,
  },

  // Catalogs
  catalogs: {
    all: (type: string) => ['catalogs', type] as const,
    byCompany: (type: string, companyId?: string) => ['catalogs', type, 'company', companyId] as const,
  },

  // Audit
  audits: {
    all: () => ['audits'] as const,
    byEntity: (entityName: string, entityId: string) => ['audits', entityName, entityId] as const,
  },

  // Reports
  reports: {
    kpi: () => ['reports', 'kpi'] as const,
    master: () => ['reports', 'master'] as const,
  },

  // Email Config
  emailConfig: {
    all: () => ['email-config'] as const,
    byCompany: (companyId: string) => ['email-config', companyId] as const,
  },
} as const;
