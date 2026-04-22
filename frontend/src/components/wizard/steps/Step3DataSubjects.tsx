import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    dataSubjects: {
      dataSubjectTypeId: string;
      approximateCount?: string;
      sourceType?: string;
      relationshipWithCompany?: string;
      notes?: string;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step3DataSubjects({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: subjectTypes } = useQuery({
    queryKey: ['catalogs', 'data-subject-types'],
    queryFn: () => catalogService.getAll('data-subject-types', user?.companyId),
  });

  const hasGlobalError = errors.some(e => e.includes('titular'));

  const addSubject = () => {
    onChange({
      dataSubjects: [...values.dataSubjects, { dataSubjectTypeId: '', approximateCount: '', sourceType: '', relationshipWithCompany: '', notes: '' }],
    });
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const updated = [...values.dataSubjects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ dataSubjects: updated });
  };

  const removeSubject = (index: number) => {
    const updated = values.dataSubjects.filter((_, i) => i !== index);
    onChange({ dataSubjects: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 3: Titulares de datos</h3>
      <p className="text-sm text-gray-500">
        Art. 38.4 Reglamento LOPDP: Titulares y categorías de datos. Art. 10.d: Principio de minimización de datos.
        Res. SPDP-SPD-2026-0005-R: Titulares de datos personales de quienes se trata información.
      </p>

      {values.dataSubjects.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          No hay titulares registrados. Agregue al menos uno.
        </p>
      )}

      {values.dataSubjects.map((subject, index) => {
        const itemError = errors.some(e => e.includes(`Titular #${index + 1}`));
        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Titular #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de titular *</label>
                <select
                  value={subject.dataSubjectTypeId}
                  onChange={(e) => updateSubject(index, 'dataSubjectTypeId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {subjectTypes?.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad estimada</label>
                <input
                  type="text"
                  value={subject.approximateCount || ''}
                  onChange={(e) => updateSubject(index, 'approximateCount', e.target.value)}
                  placeholder="Ej: 10,000"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fuente del dato</label>
                <input
                  type="text"
                  value={subject.sourceType || ''}
                  onChange={(e) => updateSubject(index, 'sourceType', e.target.value)}
                  placeholder="Ej: Directo, tercero"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Relación con la empresa</label>
                <input
                  type="text"
                  value={subject.relationshipWithCompany || ''}
                  onChange={(e) => updateSubject(index, 'relationshipWithCompany', e.target.value)}
                  placeholder="Ej: Cliente, empleado"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={subject.notes || ''}
                onChange={(e) => updateSubject(index, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addSubject}
        className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
      >
        + Agregar titular
      </button>
    </div>
  );
}
