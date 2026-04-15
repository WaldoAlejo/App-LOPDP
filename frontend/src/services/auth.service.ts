import { api } from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roleCode: string;
    companyId?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: (dto: LoginDto) => api.post<AuthResponse>('/auth/login', dto).then(r => r.data),
  refresh: (refreshToken: string) => api.post<AuthResponse['tokens']>('/auth/refresh', { refreshToken }).then(r => r.data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
};
