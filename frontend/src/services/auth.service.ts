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
    forcePasswordChange?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: (dto: LoginDto) => api.post<AuthResponse>('/auth/login', dto).then(r => r.data),
  refresh: (refreshToken: string) => api.post<AuthResponse['tokens']>('/auth/refresh', { refreshToken }).then(r => r.data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (dto: ChangePasswordDto) => api.post('/auth/change-password', dto).then(r => r.data),
};
