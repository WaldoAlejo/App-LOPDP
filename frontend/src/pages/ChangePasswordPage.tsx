import { useState } from 'react';
import { useChangePassword } from '../hooks/useChangePassword';
import { Shield, Eye, EyeOff, Loader2, Lock, Check, X } from 'lucide-react';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const changePassword = useChangePassword();

  const validations = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSymbol: /[^A-Za-z0-9]/.test(newPassword),
    matches: newPassword === confirmPassword && confirmPassword.length > 0,
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    changePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/25">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Cambio de contraseña obligatorio
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Por seguridad, debes establecer una nueva contraseña antes de continuar
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña actual
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Requisitos</p>
              <ValidationItem valid={validations.minLength} text="Mínimo 8 caracteres" />
              <ValidationItem valid={validations.hasUppercase} text="Al menos una mayúscula" />
              <ValidationItem valid={validations.hasLowercase} text="Al menos una minúscula" />
              <ValidationItem valid={validations.hasNumber} text="Al menos un número" />
              <ValidationItem valid={validations.hasSymbol} text="Al menos un símbolo" />
              <ValidationItem valid={validations.matches} text="Las contraseñas coinciden" />
            </div>

            {changePassword.isError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <X size={16} />
                {(changePassword.error as any)?.response?.data?.message ||
                  'Error al cambiar la contraseña. Intenta de nuevo.'}
              </div>
            )}

            <button
              type="submit"
              disabled={!allValid || changePassword.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-primary-600/30 disabled:opacity-60 disabled:shadow-none"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Cambiar contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <X size={14} className="text-gray-300" />
      )}
      <span className={valid ? 'text-green-700' : 'text-gray-500'}>{text}</span>
    </div>
  );
}
