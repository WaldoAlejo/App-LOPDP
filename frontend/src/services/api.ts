import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './auth.service';
import { useAuthStore } from '../store/authStore';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL no está configurada');
}

// Validate API URL format
if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
  throw new Error('VITE_API_URL debe comenzar con http:// o https://');
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true,
});

// Request interceptor: add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add security headers
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const tokens = await authService.refresh(refreshToken);
        useAuthStore.getState().setTokens(tokens);
        processQueue(null, tokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Acceso denegado');
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      console.error('Demasiadas solicitudes. Por favor intente más tarde.');
    }

    return Promise.reject(error);
  }
);
