import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './auth.service';
import { useAuthStore } from '../store/authStore';
import { sanitizePayload } from '../utils/sanitizePayload';

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

// Request interceptor: add security headers and sanitize payload
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

  // Sanitize request body for mutating methods to prevent XSS injection
  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
    config.data = sanitizePayload(config.data);
  }

  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
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
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authService.refresh();
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
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
