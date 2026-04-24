import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useAuthStore } from '../store/authStore';
import { emailConfigService } from '../services/email-config.service';
import { Mail, Server, Shield, Send, Trash2, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export function EmailConfigPage() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['email-config'],
    queryFn: () => emailConfigService.getConfig(),
  });

  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Prellenar formulario cuando se carga la configuración
  useState(() => {
    if (config) {
      setForm({
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort || 587,
        smtpUser: config.smtpUser || '',
        smtpPass: config.hasPassword ? '' : '',
        smtpFrom: config.smtpFrom || '',
      });
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data: typeof form) => emailConfigService.upsertConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-config'] });
      setTestResult({ success: true, message: 'Configuración guardada exitosamente' });
    },
    onError: (error: any) => {
      setTestResult({ success: false, message: error.response?.data?.message || 'Error al guardar' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => emailConfigService.deleteConfig(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-config'] });
      setForm({ smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpFrom: '' });
      setTestResult({ success: true, message: 'Configuración eliminada' });
    },
  });

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await emailConfigService.testConfig(form);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.response?.data?.message || 'Error al probar conexión' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);
    upsertMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
          <Mail className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Configuración de Correo</h2>
          <p className="text-sm text-gray-500">Configura el servidor SMTP para notificaciones automáticas</p>
        </div>
      </div>

      {/* Estado actual */}
      {config && (
        <div className={`rounded-lg border p-4 ${config.isActive ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            {config.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <span className={`text-sm font-medium ${config.isActive ? 'text-green-700' : 'text-yellow-700'}`}>
              {config.isActive ? 'Configuración activa' : 'Configuración inactiva'}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Servidor: {config.smtpHost}:{config.smtpPort} • Usuario: {config.smtpUser}
          </p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {/* Servidor SMTP */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-gray-400" />
                  Servidor SMTP
                </span>
              </label>
              <input
                type="text"
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Ej: smtp.gmail.com, smtp.office365.com</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Puerto
              </label>
              <select
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value={587}>587 (TLS/STARTTLS)</option>
                <option value={465}>465 (SSL)</option>
                <option value={25}>25 (Sin cifrado)</option>
                <option value={2525}>2525 (Alternativo)</option>
              </select>
            </div>
          </div>

          {/* Usuario y Contraseña */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Usuario SMTP
              </label>
              <input
                type="email"
                value={form.smtpUser}
                onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Contraseña
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.smtpPass}
                  onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                  placeholder={config?.hasPassword ? '•••••••• (dejar vacío para mantener)' : 'Contraseña'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required={!config?.hasPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {config?.hasPassword && (
                <p className="mt-1 text-xs text-gray-500">Dejar vacío para mantener la contraseña actual</p>
              )}
            </div>
          </div>

          {/* Correo remitente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Correo remitente
            </label>
            <input
              type="email"
              value={form.smtpFrom}
              onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })}
              placeholder="noreply@servientrega.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Dirección que aparecerá como remitente de las notificaciones</p>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={upsertMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {upsertMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Guardar configuración
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !form.smtpHost || !form.smtpUser}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Probar conexión
          </button>

          {config && (
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Eliminar la configuración de correo? Las notificaciones automáticas dejarán de funcionar.')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          )}
        </div>

        {/* Resultado */}
        {testResult && (
          <div className={`mt-4 rounded-md p-3 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          </div>
        )}
      </form>

      {/* Información */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-blue-800">📧 Notificaciones automáticas</h3>
        <p className="text-xs text-blue-700">
          Una vez configurado el servidor SMTP, el sistema enviará notificaciones automáticas para:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>• <strong>Nuevas observaciones DPO</strong> → Correo al creador del tratamiento</li>
          <li>• <strong>Cambios de estado</strong> → Correo al creador cuando el estado cambia</li>
          <li>• <strong>Revisión pendiente</strong> → Correo al DPO cuando un tratamiento es enviado o subsanado</li>
          <li>• <strong>Observación resuelta</strong> → Correo al DPO cuando se corrige una observación</li>
        </ul>
      </div>
    </div>
  );
}
