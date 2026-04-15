import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '../services/treatment.service';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: treatments, isLoading } = useQuery({
    queryKey: ['treatments', 'dashboard', user?.companyId],
    queryFn: () => treatmentService.getAll({ companyId: user?.companyId }),
    enabled: !!user?.companyId,
  });

  const total = treatments?.length || 0;
  const pending = treatments?.filter((t) => ['borrador', 'en_edicion', 'enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length || 0;
  const approved = treatments?.filter((t) => t.currentStatus === 'aprobado').length || 0;
  const highRisk = treatments?.filter((t) => t.highRiskFlag).length || 0;
  const requiresDpia = treatments?.filter((t) => t.requiresDpia).length || 0;

  const kpis = [
    { label: 'Total tratamientos', value: total },
    { label: 'Pendientes', value: pending },
    { label: 'Aprobados', value: approved },
    { label: 'Alto riesgo', value: highRisk, color: highRisk > 0 ? 'text-red-600' : undefined },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color || 'text-gray-900'}`}>
              {isLoading ? '-' : kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Resumen de riesgo</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tratamientos que requieren EIPD</span>
              <span className="text-lg font-bold text-orange-600">{isLoading ? '-' : requiresDpia}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tratamientos de alto riesgo</span>
              <span className="text-lg font-bold text-red-600">{isLoading ? '-' : highRisk}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Estados recientes</h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {treatments?.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">{t.name}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{t.currentStatus}</span>
                </li>
              ))}
              {treatments?.length === 0 && (
                <li className="py-2 text-sm text-gray-500">No hay tratamientos registrados.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
