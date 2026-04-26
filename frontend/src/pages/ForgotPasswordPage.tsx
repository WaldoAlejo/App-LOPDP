import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sanitizeInput } from '../utils/security';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      await authService.forgotPassword(sanitizeInput(email.trim()));
      setResult({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
      });
      setEmail('');
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Ocurrió un error. Intente nuevamente.',
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
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {result?.success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-3 text-lg font-semibold text-gray-900">¡Correo enviado!</h3>
              <p className="mt-2 text-sm text-gray-600">{result.message}</p>
              <p className="mt-4 text-xs text-gray-500">
                Revisa tu bandeja de entrada y la carpeta de spam.
                El enlace expira en 1 hora.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@servientrega.com.ec"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {result && !result.success && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Enviar enlace de recuperación
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
