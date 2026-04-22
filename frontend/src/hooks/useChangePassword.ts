import { useMutation } from '@tanstack/react-query';
import { authService, type ChangePasswordDto } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function useChangePassword() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => authService.changePassword(dto),
    onSuccess: () => {
      if (user) {
        setUser({ ...user, forcePasswordChange: false });
      }
      navigate('/');
    },
  });
}
