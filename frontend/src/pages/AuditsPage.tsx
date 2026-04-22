import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import { useAuthStore } from '../store/authStore';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, ChevronLeft, ChevronRight, ClipboardList, FilterX } from 'lucide-react';


export function AuditsPage() {
  const user = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState({
    action: '',
    entityName: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['audits', filters, page, user?.companyId],
    queryFn: () =>
      auditService.getAll({
        ...filters,
        skip: page * pageSize,
        take: pageSize,
      }),
    enabled: !!user,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const hasFilters = filters.action || filters.entityName || filters.startDate || filters.endDate;

  const clearFilters = () => {
    setFilters({ action: '', entityName: '', startDate: '', endDate: '' });
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Auditoría</h2>
        <p className="text-sm text-gray-500">
          {data?.total || 0} registros de actividad en el sistema
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.action}
            onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(0); }}
            placeholder="Acción (ej: LOGIN_SUCCESS)"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.entityName}
            onChange={(e) => { setFilters((f) => ({ ...f, entityName: e.target.value })); setPage(0); }}
            placeholder="Entidad (ej: Treatment)"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })); setPage(0); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })); setPage(0); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <FilterX size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Sin resultados' : 'Sin registros'}
          description={
            hasFilters
              ? 'No hay registros que coincidan con los filtros aplicados.'
              : 'Aún no hay actividad registrada en el sistema.'
          }
          icon={hasFilters ? 'search' : 'empty'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acción</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cambios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.data.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('es-EC', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      <ClipboardList size={10} />
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {log.entityName} {log.entityId ? <span className="text-gray-400">({log.entityId.slice(0, 8)}...)</span> : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {log.userId ? <span className="font-mono text-xs">{log.userId.slice(0, 8)}...</span> : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {log.oldValuesJson || log.newValuesJson ? (
                      <details className="group/details">
                        <summary className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-700">
                          Ver cambios
                        </summary>
                        <div className="mt-2 max-w-xs space-y-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                          {log.oldValuesJson && (
                            <div>
                              <span className="font-semibold text-red-600">Antes:</span>
                              <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-[10px]">
                                {log.oldValuesJson}
                              </pre>
                            </div>
                          )}
                          {log.newValuesJson && (
                            <div>
                              <span className="font-semibold text-green-600">Después:</span>
                              <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-[10px]">
                                {log.newValuesJson}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página <span className="font-semibold">{page + 1}</span> de{' '}
            <span className="font-semibold">{totalPages}</span>{' '}
            <span className="text-gray-400">({data?.total} registros)</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            Siguiente <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
