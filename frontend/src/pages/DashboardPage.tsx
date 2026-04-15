export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total tratamientos', value: 0 },
          { label: 'Pendientes', value: 0 },
          { label: 'Aprobados', value: 0 },
          { label: 'Alto riesgo', value: 0 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
