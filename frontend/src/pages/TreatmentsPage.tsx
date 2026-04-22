import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { treatmentService } from '../services/treatment.service';
import { useAuthStore } from '../store/authStore';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Plus, FileText, AlertTriangle, MessageSquare, FilterX } from 'lucide-react';
import { clsx } from 'clsx';

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
  borrador: 'bg-gray-100 text-gray-700 border-gray-200',
  en_edicion: 'bg-blue-50 text-blue-700 border-blue-200',
  enviado: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  en_revision_dpo: 'bg-purple-50 text-purple-700 border-purple-200',
  observado: 'bg-orange-50 text-orange-700 border-orange-200',
  en_correccion: 'bg-pink-50 text-pink-700 border-pink-200',
  subsanado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  validado: 'bg-teal-50 text-teal-700 border-teal-200',
  aprobado: 'bg-green-50 text-green-700 border-green-200',
  requiere_eipd: 'bg-red-50 text-red-700 border-red-200',
  archivado: 'bg-gray-50 text-gray-500 border-gray-200',
  reemplazado: 'bg-gray-50 text-gray-500 border-gray-200',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));

export function TreatmentsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: treatments, isLoading } = useQuery({
    queryKey: ['treatments'],
    queryFn: () => treatmentService.getAll({ companyId: user?.companyId }),
  });

  const editableStatuses = new Set(['borrador', 'en_edicion', 'observado', 'en_correccion']);

  const filtered = treatments?.filter((t) => {
    const matchesSearch =
      !search ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasFilters = search || statusFilter;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tratamientos (RAT)</h2>
          <p className="text-sm text-gray-500">
            {treatments?.length || 0} tratamientos registrados
          </p>
        </div>
        <button
          onClick={() => navigate('/treatments/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-primary-600/30 active:scale-[0.98]"
        >
          <Plus size={16} />
          Nuevo tratamiento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <FilterX size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : filtered?.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Sin resultados' : 'No hay tratamientos'}
          description={
            hasFilters
              ? 'Intenta con otros términos de búsqueda o filtros.'
              : 'Comienza creando tu primer tratamiento de datos.'
          }
          icon={hasFilters ? 'search' : 'empty'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Versión
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Alertas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Creado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered?.map((t) => (
                <tr
                  key={t.id}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={14}
                        className="text-gray-400 group-hover:text-primary-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {t.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    v{t.version}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        statusColors[t.currentStatus] ||
                          'bg-gray-100 text-gray-700 border-gray-200'
                      )}
                    >
                      {statusLabels[t.currentStatus] || t.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.highRiskFlag && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle size={10} />
                          Alto riesgo
                        </span>
                      )}
                      {t.requiresDpia && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                          EIPD
                        </span>
                      )}
                      {(t.observations?.filter((o: any) => o.status === 'abierta')
                        .length || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                          <MessageSquare size={10} />
                          {t.observations?.filter((o: any) => o.status === 'abierta')
                            .length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString('es-EC', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editableStatuses.has(t.currentStatus) ? (
                      <button
                        onClick={() => navigate(`/treatments/${t.id}/edit`)}
                        className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50"
                      >
                        Editar
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Bloqueado</span>
                    )}
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
