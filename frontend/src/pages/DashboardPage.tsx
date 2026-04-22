import { useEffect, useRef, useState, type ReactNode } from 'react';
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
} from 'recharts';
import { kpiService } from '../services/kpi.service';
import { useAuthStore } from '../store/authStore';

function ChartContainer({ children }: { children: (size: { width: number; height: number }) => ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateSize);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const isReady = size.width > 0 && size.height > 0;

  return <div ref={containerRef} className="h-64 min-w-0">{isReady ? children(size) : null}</div>;
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

  const kpiCards = [
    { label: 'Total tratamientos', value: kpis?.totalTreatments || 0 },
    { label: 'Pendientes', value: kpis?.pendingTreatments || 0, color: 'text-blue-600' },
    { label: 'Aprobados', value: kpis?.approvedTreatments || 0, color: 'text-green-600' },
    { label: 'En revisión DPO', value: kpis?.underDpoReview || 0, color: 'text-purple-600' },
    { label: 'Alto riesgo', value: kpis?.highRiskTreatments || 0, color: 'text-red-600' },
    { label: 'Requieren EIPD', value: kpis?.requiresDpia || 0, color: 'text-orange-600' },
    { label: 'EIPD completado', value: kpis?.dpiaCompleted || 0, color: 'text-teal-600' },
    { label: 'Con observaciones abiertas', value: kpis?.withOpenObservations || 0, color: 'text-rose-600' },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color || 'text-gray-900'}`}>
              {isLoading ? '-' : kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Tratamientos por estado</h3>
          <ChartContainer>
            {({ width, height }) =>
              isLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : statusData.length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos</p>
              ) : (
                <PieChart width={width} height={height}>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )
            }
          </ChartContainer>
        </div>

        <div className="min-w-0 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Distribución de riesgo</h3>
          <ChartContainer>
            {({ width, height }) =>
              isLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : riskData.length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos</p>
              ) : (
                <PieChart width={width} height={height}>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-risk-${index}`} fill={riskColors[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )
            }
          </ChartContainer>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Actividad reciente (últimos 30 días)</h3>
          <ChartContainer>
            {({ width, height }) =>
              isLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : activityData.length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos</p>
              ) : (
                <LineChart width={width} height={height} data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              )
            }
          </ChartContainer>
        </div>

        <div className="min-w-0 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Top áreas con más tratamientos</h3>
          <ChartContainer>
            {({ width, height }) =>
              isLoading ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : topAreasData.length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos</p>
              ) : (
                <BarChart width={width} height={height} data={topAreasData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="areaName" type="category" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              )
            }
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
