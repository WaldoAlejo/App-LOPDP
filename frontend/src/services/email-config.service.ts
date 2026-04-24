import { api } from './api';

export interface EmailConfig {
  id?: string;
  companyId?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  isActive?: boolean;
  hasPassword?: boolean;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
}

export const emailConfigService = {
  getConfig: async (companyId?: string) => {
    const params = companyId ? { companyId } : undefined;
    const { data } = await api.get<EmailConfig | null>('/email-config', { params });
    return data;
  },

  upsertConfig: async (config: EmailConfig, companyId?: string) => {
    const params = companyId ? { companyId } : undefined;
    const { data } = await api.post<EmailConfig>('/email-config', config, { params });
    return data;
  },

  testConfig: async (config: EmailConfig, companyId?: string) => {
    const params = companyId ? { companyId } : undefined;
    const { data } = await api.post<TestEmailResponse>('/email-config/test', config, { params });
    return data;
  },

  deleteConfig: async (companyId?: string) => {
    const params = companyId ? { companyId } : undefined;
    await api.delete('/email-config', { params });
  },
};
