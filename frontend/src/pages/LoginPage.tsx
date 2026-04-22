import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { Shield, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-servi-gray-light to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo y marca */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-servi-green shadow-lg shadow-servi-green/25">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-servi-black">
            RAT Servientrega
          </h1>
          <p className="mt-2 text-sm text-servi-gray">
            Registro de Actividades de Tratamiento
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <h2 className="mb-1 text-lg font-semibold text-servi-black">
            Bienvenido de nuevo
          </h2>
          <p className="mb-6 text-sm text-servi-gray">
            Ingresa tus credenciales para acceder al sistema
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-servi-gray-dark">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-servi-gray"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm transition-colors focus:border-servi-green focus:outline-none focus:ring-2 focus:ring-servi-green/20"
                  placeholder="usuario@servientrega.com.ec"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-servi-gray-dark">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-servi-gray"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-servi-green focus:outline-none focus:ring-2 focus:ring-servi-green/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-servi-gray hover:text-servi-gray-dark"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {login.isError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                {(login.error as any)?.response?.data?.message ||
                  'Credenciales incorrectas. Intenta de nuevo.'}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-servi-green px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-servi-green/25 transition-all hover:bg-servi-green-dark hover:shadow-servi-green/30 disabled:opacity-60 disabled:shadow-none"
            >
              {login.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-servi-gray">
          © {new Date().getFullYear()} Servientrega Ecuador S.A. — Protección de datos personales
        </p>
      </div>
    </div>
  );
}
