import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    securityMeasures: {
      securityMeasureId: string;
      implemented: boolean;
      evidence?: string;
      criticality?: string;
      notes?: string;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step10Security({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: securityCatalog } = useQuery({
    queryKey: ['catalogs', 'security-measures'],
    queryFn: () => catalogService.getAll('security-measures', user?.companyId),
  });

  const hasGlobalError = errors.some((error) => error.includes('seguridad'));

  const addMeasure = () => {
    onChange({
      securityMeasures: [
        ...values.securityMeasures,
        {
          securityMeasureId: '',
          implemented: true,
          evidence: '',
          criticality: 'media',
          notes: '',
        },
      ],
    });
  };

  const updateMeasure = (index: number, field: string, value: string | boolean) => {
    const updated = [...values.securityMeasures];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ securityMeasures: updated });
  };

  const removeMeasure = (index: number) => {
    onChange({ securityMeasures: values.securityMeasures.filter((_, currentIndex) => currentIndex !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 10: Medidas de seguridad</h3>
      <p className="text-sm text-gray-500">
        Art. 38.9 Reglamento LOPDP: Medidas técnicas, jurídicas, administrativas y organizativas.
        Art. 33-35 Reglamento LOPDP: Obligación de implementar medidas de seguridad apropiadas.
        Res. SPDP-SPD-2026-0005-R: Medidas de seguridad implementadas.
      </p>

      {values.securityMeasures.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          No hay medidas registradas. Agregue al menos una medida técnica, jurídica, administrativa u organizativa.
        </p>
      )}

      {values.securityMeasures.map((measure, index) => {
        const itemError = errors.some((error) => error.includes(`Medida #${index + 1}`));

        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Medida #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeMeasure(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Medida de seguridad *</label>
                <select
                  value={measure.securityMeasureId}
                  onChange={(e) => updateMeasure(index, 'securityMeasureId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {securityCatalog?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Criticidad</label>
                <select
                  value={measure.criticality || 'media'}
                  onChange={(e) => updateMeasure(index, 'criticality', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Evidencia</label>
                <input
                  type="text"
                  value={measure.evidence || ''}
                  onChange={(e) => updateMeasure(index, 'evidence', e.target.value)}
                  placeholder="Ej: política, procedimiento, control técnico"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={measure.implemented}
                    onChange={(e) => updateMeasure(index, 'implemented', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Implementada
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={measure.notes || ''}
                onChange={(e) => updateMeasure(index, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addMeasure}
        className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
      >
        + Agregar medida de seguridad
      </button>
    </div>
  );
}
