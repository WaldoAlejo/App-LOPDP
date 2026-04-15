import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/review.service';
import { useAuthStore } from '../store/authStore';

const statusLabels: Record<string, string> = {
  enviado: 'Enviado',
  en_revision_dpo: 'En revisión DPO',
  subsanado: 'Subsanado',
};

const statusColors: Record<string, string> = {
  enviado: 'bg-yellow-100 text-yellow-700',
  en_revision_dpo: 'bg-purple-100 text-purple-700',
  subsanado: 'bg-indigo-100 text-indigo-700',
};

export function ReviewsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: treatments, isLoading } = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => reviewService.getPendingTreatments({ companyId: user?.companyId }),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Bandeja de revisión DPO</h2>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Alertas</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Envío</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : (
              treatments?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[t.currentStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[t.currentStatus] || t.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-1">
                      {t.highRiskFlag && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Alto riesgo</span>
                      )}
                      {t.requiresDpia && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">EIPD</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.submissionDate ? new Date(t.submissionDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => navigate(`/reviews/${t.id}`)}
                      className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
