import { api } from './api';
import { validateApiResponse, LoginResponseSchema } from '../schemas/api.schemas';

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
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (dto: LoginDto) => {
    const response = await api.post('/auth/login', dto);
    return validateApiResponse(LoginResponseSchema, response.data, '/auth/login');
  },
  refresh: () => api.post('/auth/refresh').then(r => r.data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (dto: ChangePasswordDto) => api.post('/auth/change-password', dto).then(r => r.data),
};
