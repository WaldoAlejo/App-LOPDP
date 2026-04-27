import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { kpiService } from '../services/kpi.service';
import { useAuthStore } from '../store/authStore';
import { Skeleton, SkeletonChart } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ClipboardCheck,
  MessageSquareWarning,
  Eye,
} from 'lucide-react';
import { clsx } from 'clsx';

function ChartContainer({ children }: { children: ReactNode }) {
  return (
    <div className="h-64 w-full min-w-0 min-h-[16rem]">
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

const statusColors: Record<string, string> = {
  borrador: '#9ca3af',
  en_edicion: '#60a5fa',
  enviado: '#fbbf24',
  en_revision_dpo: '#a78bfa',
  observado: '#f87171',
  en_correccion: '#fb923c',
  subsanado: '#34d399',
  validado: '#22d3ee',
  aprobado: '#4ade80',
  requiere_eipd: '#f472b6',
  archivado: '#6b7280',
};

const riskColors: Record<string, string> = {
  bajo: '#22c55e',
  medio: '#eab308',
  alto: '#f97316',
  critico: '#ef4444',
  sin_evaluar: '#9ca3af',
};

const kpiConfig = [
  {
    label: 'Total tratamientos',
    key: 'totalTreatments',
    icon: FileText,
    color: 'text-gray-700',
    bg: 'bg-gray-50',
  },
  {
    label: 'Pendientes',
    key: 'pendingTreatments',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Aprobados',
    key: 'approvedTreatments',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'En revisión DPO',
    key: 'underDpoReview',
    icon: Eye,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Alto riesgo',
    key: 'highRiskTreatments',
    icon: ShieldAlert,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    label: 'Requieren EIPD',
    key: 'requiresDpia',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    label: 'EIPD completado',
    key: 'dpiaCompleted',
    icon: ClipboardCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    label: 'Con observaciones',
    key: 'withOpenObservations',
    icon: MessageSquareWarning,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['kpis', user?.companyId],
    queryFn: () => kpiService.getAll(user?.companyId),
    enabled: !!user?.companyId,
  });

  const statusData = kpis
    ? Object.entries(kpis.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const riskData = kpis
    ? Object.entries(kpis.riskLevelBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const activityData = kpis?.recentActivity.map((d) => ({ date: d.date.slice(5), count: d.count })) || [];

  const topAreasData = kpis?.topAreas || [];

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Resumen de tratamientos y métricas clave
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          : kpiConfig.map((kpi) => {
              const value = (kpis as any)?.[kpi.key] || 0;
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.key}
                  className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{kpi.label}</p>
                      <p
                        className={clsx(
                          'mt-1 text-2xl font-bold tabular-nums',
                          kpi.color
                        )}
                      >
                        {value}
                      </p>
                    </div>
                    <div
                      className={clsx(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        kpi.bg
                      )}
                    >
                      <Icon size={20} className={kpi.color} />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">
            Tratamientos por estado
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Distribución actual de todos los RAT
          </p>
          {isLoading ? (
            <SkeletonChart />
          ) : statusData.length === 0 ? (
            <EmptyState title="Sin datos" description="Aún no hay tratamientos registrados." />
          ) : (
            <ChartContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.name] || '#9ca3af'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          )}
        </div>

        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">
            Distribución de riesgo
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Niveles de riesgo evaluados
          </p>
          {isLoading ? (
            <SkeletonChart />
          ) : riskData.length === 0 ? (
            <EmptyState title="Sin datos" description="Aún no hay evaluaciones de riesgo." />
          ) : (
            <ChartContainer>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {riskData.map((entry, index) => (
                    <Cell
                      key={`cell-risk-${index}`}
                      fill={riskColors[entry.name] || '#9ca3af'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">
            Actividad reciente
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Tratamientos creados en los últimos 30 días
          </p>
          {isLoading ? (
            <SkeletonChart />
          ) : activityData.length === 0 ? (
            <EmptyState title="Sin actividad" description="No se ha registrado actividad reciente." />
          ) : (
            <ChartContainer>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>

        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">
            Top áreas con más tratamientos
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Áreas ordenadas por cantidad de RAT
          </p>
          {isLoading ? (
            <SkeletonChart />
          ) : topAreasData.length === 0 ? (
            <EmptyState title="Sin datos" description="No hay áreas con tratamientos registrados." />
          ) : (
            <ChartContainer>
              <BarChart
                data={topAreasData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis
                  dataKey="areaName"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}
