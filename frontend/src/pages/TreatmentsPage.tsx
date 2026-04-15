import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '../services/treatment.service';
import { useAuthStore } from '../store/authStore';

const statusLabels: Record<string, string> = {
  borrador: 'Borrador',
  en_edicion: 'En edición',
  enviado: 'Enviado',
  en_revision_dpo: 'En revisión DPO',
  observado: 'Observado',
  en_correccion: 'En corrección',
  subsanado: 'Subsanado',
  validado: 'Validado',
  aprobado: 'Aprobado',
  requiere_eipd: 'Requiere EIPD',
  archivado: 'Archivado',
  reemplazado: 'Reemplazado',
};

const statusColors: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  en_edicion: 'bg-blue-100 text-blue-700',
  enviado: 'bg-yellow-100 text-yellow-700',
  en_revision_dpo: 'bg-purple-100 text-purple-700',
  observado: 'bg-orange-100 text-orange-700',
  en_correccion: 'bg-pink-100 text-pink-700',
  subsanado: 'bg-indigo-100 text-indigo-700',
  validado: 'bg-teal-100 text-teal-700',
  aprobado: 'bg-green-100 text-green-700',
  requiere_eipd: 'bg-red-100 text-red-700',
  archivado: 'bg-gray-100 text-gray-500',
  reemplazado: 'bg-gray-100 text-gray-500',
};

export function TreatmentsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: treatments, isLoading } = useQuery({
    queryKey: ['treatments'],
    queryFn: () => treatmentService.getAll({ companyId: user?.companyId }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Tratamientos (RAT)</h2>
        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Nuevo tratamiento
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Versión</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Alertas</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : (
              treatments?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.version}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[t.currentStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[t.currentStatus] || t.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-1">
                      {t.highRiskFlag && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Alto riesgo</span>
                      )}
                      {t.requiresDpia && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">EIPD</span>
                      )}
                      {(t.observations?.filter(o => o.status === 'abierta').length || 0) > 0 && (
                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                          Obs: {t.observations?.filter(o => o.status === 'abierta').length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
