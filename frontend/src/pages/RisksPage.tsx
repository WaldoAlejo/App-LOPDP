import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { treatmentService } from '../services/treatment.service';
import { useAuthStore } from '../store/authStore';

const levelLabels: Record<string, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};

const levelColors: Record<string, string> = {
  bajo: 'bg-green-100 text-green-700',
  medio: 'bg-yellow-100 text-yellow-700',
  alto: 'bg-orange-100 text-orange-700',
  critico: 'bg-red-100 text-red-700',
};

export function RisksPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: highRiskTreatments, isLoading } = useQuery({
    queryKey: ['treatments', 'high-risk'],
    queryFn: () => treatmentService.getAll({ companyId: user?.companyId }),
    select: (data) => data.filter((t) => t.highRiskFlag || t.requiresDpia),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Alertas de riesgo y EIPD</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tratamientos alto riesgo</p>
          <p className="text-2xl font-bold text-red-600">
            {highRiskTreatments?.filter((t) => t.highRiskFlag).length || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Requieren EIPD</p>
          <p className="text-2xl font-bold text-orange-600">
            {highRiskTreatments?.filter((t) => t.requiresDpia).length || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">EIPD pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {highRiskTreatments?.filter((t) => t.requiresDpia && t.dpiaStatus !== 'completado').length || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total tratamientos</p>
          <p className="text-2xl font-bold text-gray-900">
            {highRiskTreatments?.length || 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nivel de riesgo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">EIPD</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : (
              highRiskTreatments?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${levelColors[t.riskLevel || 'bajo'] || 'bg-gray-100 text-gray-700'}`}>
                      {levelLabels[t.riskLevel || 'bajo'] || t.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {t.requiresDpia ? (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                        {t.dpiaStatus === 'completado' ? 'Completado' : 'Pendiente'}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.currentStatus}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => navigate(`/reviews/${t.id}`)}
                      className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {highRiskTreatments?.length === 0 && !isLoading && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No hay tratamientos con alertas de riesgo.
          </p>
        )}
      </div>
    </div>
  );
}
