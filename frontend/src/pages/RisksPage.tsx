import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { treatmentService } from '../services/treatment.service';
import { useAuthStore } from '../store/authStore';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, ShieldAlert, AlertTriangle, ClipboardCheck, Activity } from 'lucide-react';
import { clsx } from 'clsx';

const levelLabels: Record<string, string> = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};

const levelColors: Record<string, string> = {
  bajo: 'bg-green-50 text-green-700 border-green-200',
  medio: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  alto: 'bg-orange-50 text-orange-700 border-orange-200',
  critico: 'bg-red-50 text-red-700 border-red-200',
};

export function RisksPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const { data: highRiskTreatments, isLoading } = useQuery({
    queryKey: ['treatments', 'high-risk'],
    queryFn: () => treatmentService.getAll({ companyId: user?.companyId }),
    select: (data) => data.filter((t) => t.highRiskFlag || t.requiresDpia),
  });

  const filtered = highRiskTreatments?.filter((t) =>
    !search ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    highRisk: highRiskTreatments?.filter((t) => t.highRiskFlag).length || 0,
    requiresDpia: highRiskTreatments?.filter((t) => t.requiresDpia).length || 0,
    dpiaPending: highRiskTreatments?.filter((t) => t.requiresDpia && t.dpiaStatus !== 'completado').length || 0,
    total: highRiskTreatments?.length || 0,
  };

  const statCards = [
    { label: 'Alto riesgo', value: stats.highRisk, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Requieren EIPD', value: stats.requiresDpia, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'EIPD pendientes', value: stats.dpiaPending, icon: ClipboardCheck, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total alertas', value: stats.total, icon: Activity, color: 'text-gray-700', bg: 'bg-gray-50' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Alertas de riesgo y EIPD</h2>
          <p className="text-sm text-gray-500">Tratamientos que requieren atención especial</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tratamiento..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className={clsx('mt-1 text-2xl font-bold tabular-nums', stat.color)}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
                      <Icon size={20} className={stat.color} />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filtered?.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'Sin alertas'}
          description={
            search
              ? 'No hay tratamientos que coincidan con tu búsqueda.'
              : 'No hay tratamientos con alertas de riesgo. ¡Todo está bajo control!'
          }
          icon={search ? 'search' : 'empty'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nivel de riesgo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">EIPD</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered?.map((t) => (
                <tr key={t.id} className="group transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{t.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      levelColors[t.riskLevel || 'bajo'] || 'bg-gray-100 text-gray-700 border-gray-200'
                    )}>
                      {levelLabels[t.riskLevel || 'bajo'] || t.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.requiresDpia ? (
                      <span className={clsx(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        t.dpiaStatus === 'completado'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      )}>
                        {t.dpiaStatus === 'completado' ? 'Completado' : 'Pendiente'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.currentStatus}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/reviews/${t.id}`)}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
