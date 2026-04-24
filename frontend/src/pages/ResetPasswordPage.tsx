import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Redirigir si no hay token
  useEffect(() => {
    if (!token) {
      setResult({
        success: false,
        message: 'El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.',
      });
    }
  }, [token]);

  const validatePassword = (): string | null => {
    if (newPassword.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/[A-Z]/.test(newPassword)) {
      return 'La contraseña debe tener al menos una mayúscula';
    }
    if (!/[a-z]/.test(newPassword)) {
      return 'La contraseña debe tener al menos una minúscula';
    }
    if (!/[0-9]/.test(newPassword)) {
      return 'La contraseña debe tener al menos un número';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return 'La contraseña debe tener al menos un carácter especial';
    }
    if (newPassword !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const validationError = validatePassword();
    if (validationError) {
      setResult({ success: false, message: validationError });
      return;
    }

    if (!token) return;

    setIsSubmitting(true);

    try {
      await authService.resetPassword(token, newPassword);
      setResult({
        success: true,
        message: 'Tu contraseña ha sido actualizada correctamente.',
      });
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'El enlace ha expirado o no es válido. Solicita uno nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-servi-green shadow-lg shadow-servi-green/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crea una nueva contraseña segura para tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {result?.success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-3 text-lg font-semibold text-gray-900">¡Contraseña actualizada!</h3>
              <p className="mt-2 text-sm text-gray-600">{result.message}</p>
              <p className="mt-2 text-xs text-gray-500">Serás redirigido al inicio de sesión en unos segundos...</p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva contraseña */}
              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                    disabled={isSubmitting || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un especial
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                  disabled={isSubmitting || !token}
                />
              </div>

              {/* Error */}
              {result && !result.success && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Restablecer contraseña
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Volver */}
        {!result?.success && (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
