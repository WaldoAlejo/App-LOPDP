import { useMutation } from '@tanstack/react-query';
import { authService, type ChangePasswordDto } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export function useChangePassword() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => authService.changePassword(dto),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, forcePasswordChange: false });
      }
    },
  });
}
