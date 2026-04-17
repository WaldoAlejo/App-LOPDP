import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    legalBases: {
      legalBasisId: string;
      justification?: string;
      isMainBasis: boolean;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step5LegalBasis({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: legalBasesCatalog } = useQuery({
    queryKey: ['catalogs', 'legal-bases'],
    queryFn: () => catalogService.getAll('legal-bases', user?.companyId),
  });

  const hasGlobalError = errors.some(e => e.includes('base legal'));

  const addBasis = () => {
    onChange({
      legalBases: [...values.legalBases, { legalBasisId: '', justification: '', isMainBasis: false }],
    });
  };

  const updateBasis = (index: number, field: string, value: string | boolean) => {
    const updated = [...values.legalBases];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ legalBases: updated });
  };

  const removeBasis = (index: number) => {
    const updated = values.legalBases.filter((_, i) => i !== index);
    onChange({ legalBases: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 5: Bases legitimadoras</h3>
      <p className="text-sm text-gray-500">
        Art. 38.7 Reglamento LOPDP: Bases legitimadoras. Art. 7 LOPDP: El tratamiento será legítimo si se cumple con consentimiento, obligación legal, ejecución de contrato, interés legítimo, entre otros.
      </p>

      {values.legalBases.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          No hay bases legales registradas. Agregue al menos una.
        </p>
      )}

      {values.legalBases.map((basis, index) => {
        const itemError = errors.some(e => e.includes(`Base legal #${index + 1}`));
        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Base legal #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeBasis(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Base legal *</label>
                <select
                  value={basis.legalBasisId}
                  onChange={(e) => updateBasis(index, 'legalBasisId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {legalBasesCatalog?.map((lb) => (
                    <option key={lb.id} value={lb.id}>{lb.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={basis.isMainBasis}
                    onChange={(e) => updateBasis(index, 'isMainBasis', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Es la base principal
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Justificación operativa</label>
              <textarea
                value={basis.justification || ''}
                onChange={(e) => updateBasis(index, 'justification', e.target.value)}
                rows={2}
                placeholder="Explique por qué esta base aplica al tratamiento"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addBasis}
        className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
      >
        + Agregar base legal
      </button>
    </div>
  );
}
