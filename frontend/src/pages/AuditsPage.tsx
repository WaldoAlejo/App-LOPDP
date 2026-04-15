import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import { useAuthStore } from '../store/authStore';

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Auditoría</h2>

      <div className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Acción</label>
          <input
            type="text"
            value={filters.action}
            onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(0); }}
            placeholder="Ej: LOGIN_SUCCESS"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Entidad</label>
          <input
            type="text"
            value={filters.entityName}
            onChange={(e) => { setFilters((f) => ({ ...f, entityName: e.target.value })); setPage(0); }}
            placeholder="Ej: Treatment"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Desde</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })); setPage(0); }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Hasta</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })); setPage(0); }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Acción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">IP</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cambios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">Cargando...</td>
              </tr>
            ) : (
              data?.data.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.entityName} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.userId ? log.userId.slice(0, 8) + '...' : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.ipAddress || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {log.oldValuesJson || log.newValuesJson ? (
                      <details>
                        <summary className="cursor-pointer text-primary-600 hover:underline">Ver</summary>
                        <div className="mt-1 max-w-xs whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs text-gray-800">
                          {log.oldValuesJson && <div><strong>Antes:</strong> {log.oldValuesJson}</div>}
                          {log.newValuesJson && <div><strong>Después:</strong> {log.newValuesJson}</div>}
                        </div>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {data?.data.length === 0 && !isLoading && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">No hay registros de auditoría.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page + 1} de {totalPages} ({data?.total} registros)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
