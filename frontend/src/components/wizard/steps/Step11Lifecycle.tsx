import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface LifecycleItem {
  lifecyclePhaseId: string;
  activityDescription?: string;
  processedDataDescription?: string;
  participants?: string;
  mediumOrSupport?: string;
  technologies?: string;
  linkedDocuments?: string;
  securityMeasuresByPhase?: string;
  risksByPhase?: string;
}

interface Props {
  values: {
    lifecycle: LifecycleItem[];
    medium?: string;
    technologies?: string;
    linkedDocuments?: string;
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step11Lifecycle({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: lifecycleCatalog } = useQuery({
    queryKey: ['catalogs', 'lifecycle-phases'],
    queryFn: () => catalogService.getAll('lifecycle-phases', user?.companyId),
  });

  const addPhase = () => {
    onChange({
      lifecycle: [
        ...values.lifecycle,
        {
          lifecyclePhaseId: '',
          activityDescription: '',
          processedDataDescription: '',
          participants: '',
          mediumOrSupport: values.medium || '',
          technologies: values.technologies || '',
          linkedDocuments: values.linkedDocuments || '',
          securityMeasuresByPhase: '',
          risksByPhase: '',
        },
      ],
    });
  };

  const updatePhase = (index: number, field: keyof LifecycleItem, value: string) => {
    const updated = [...values.lifecycle];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ lifecycle: updated });
  };

  const removePhase = (index: number) => {
    onChange({ lifecycle: values.lifecycle.filter((_, currentIndex) => currentIndex !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 11: Ciclo de vida del dato</h3>
      <p className="text-sm text-gray-500">
        Art. 10 LOPDP: Principios de protección de datos durante todo el ciclo de vida — recolección, almacenamiento, uso, transmisión, conservación y eliminación.
      </p>

      {values.lifecycle.length === 0 && (
        <p className="text-sm text-gray-500">
          Puede registrar las fases del tratamiento para dejar trazabilidad operativa de captura, uso, almacenamiento, circulación y eliminación.
        </p>
      )}

      {values.lifecycle.map((item, index) => {
        const itemError = errors.some((error) => error.includes(`Fase #${index + 1}`));

        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Fase #{index + 1}</span>
              <button
                type="button"
                onClick={() => removePhase(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Fase del ciclo de vida *</label>
                <select
                  value={item.lifecyclePhaseId}
                  onChange={(e) => updatePhase(index, 'lifecyclePhaseId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {lifecycleCatalog?.map((phase) => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Actividad realizada *</label>
                <textarea
                  value={item.activityDescription || ''}
                  onChange={(e) => updatePhase(index, 'activityDescription', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Datos procesados</label>
                <textarea
                  value={item.processedDataDescription || ''}
                  onChange={(e) => updatePhase(index, 'processedDataDescription', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Participantes</label>
                <input
                  type="text"
                  value={item.participants || ''}
                  onChange={(e) => updatePhase(index, 'participants', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Soporte o medio</label>
                <input
                  type="text"
                  value={item.mediumOrSupport || ''}
                  onChange={(e) => updatePhase(index, 'mediumOrSupport', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tecnologías</label>
                <input
                  type="text"
                  value={item.technologies || ''}
                  onChange={(e) => updatePhase(index, 'technologies', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Documentos vinculados</label>
                <input
                  type="text"
                  value={item.linkedDocuments || ''}
                  onChange={(e) => updatePhase(index, 'linkedDocuments', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Medidas por fase</label>
                <textarea
                  value={item.securityMeasuresByPhase || ''}
                  onChange={(e) => updatePhase(index, 'securityMeasuresByPhase', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Riesgos por fase</label>
                <textarea
                  value={item.risksByPhase || ''}
                  onChange={(e) => updatePhase(index, 'risksByPhase', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addPhase}
        className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
      >
        + Agregar fase del ciclo de vida
      </button>
    </div>
  );
}
