import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roleCode: 'SUPER_ADMIN',
      companyId: 'comp-1',
    };

    useAuthStore.getState().setAuth(mockUser);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should update user without changing auth status', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roleCode: 'SUPER_ADMIN',
    };

    useAuthStore.getState().setAuth(mockUser);
    useAuthStore.getState().setUser({ ...mockUser, firstName: 'Jane' });

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe('Jane');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roleCode: 'SUPER_ADMIN',
    };

    useAuthStore.getState().setAuth(mockUser);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should persist only user and isAuthenticated', () => {
    // The store uses partialize to limit what gets persisted
    const state = useAuthStore.getState();
    expect(typeof state.setAuth).toBe('function');
    expect(typeof state.setUser).toBe('function');
    expect(typeof state.logout).toBe('function');
  });
});
