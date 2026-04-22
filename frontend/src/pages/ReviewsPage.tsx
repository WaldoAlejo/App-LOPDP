import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/review.service';
import { useAuthStore } from '../store/authStore';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Gavel, AlertTriangle, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

const statusLabels: Record<string, string> = {
  enviado: 'Enviado',
  en_revision_dpo: 'En revisión DPO',
  subsanado: 'Subsanado',
};

const statusColors: Record<string, string> = {
  enviado: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  en_revision_dpo: 'bg-purple-50 text-purple-700 border-purple-200',
  subsanado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function ReviewsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const { data: treatments, isLoading } = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => reviewService.getPendingTreatments({ companyId: user?.companyId }),
  });

  const filtered = treatments?.filter((t) =>
    !search ||
    t.code.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bandeja de revisión DPO</h2>
          <p className="text-sm text-gray-500">
            {treatments?.length || 0} tratamientos pendientes de revisión
          </p>
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

      {isLoading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filtered?.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'Bandeja vacía'}
          description={
            search
              ? 'No hay tratamientos que coincidan con tu búsqueda.'
              : 'No hay tratamientos pendientes de revisión en este momento.'
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Alertas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Envío</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered?.map((t) => (
                <tr key={t.id} className="group transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Gavel size={14} className="text-gray-400 group-hover:text-primary-500" />
                      <span className="text-sm font-semibold text-gray-900">{t.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      statusColors[t.currentStatus] || 'bg-gray-100 text-gray-700 border-gray-200'
                    )}>
                      {statusLabels[t.currentStatus] || t.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.highRiskFlag && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                          <ShieldAlert size={10} /> Alto riesgo
                        </span>
                      )}
                      {t.requiresDpia && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                          <AlertTriangle size={10} /> EIPD
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {t.submissionDate
                      ? new Date(t.submissionDate).toLocaleDateString('es-EC', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/reviews/${t.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
                    >
                      <Gavel size={12} />
                      Revisar
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
