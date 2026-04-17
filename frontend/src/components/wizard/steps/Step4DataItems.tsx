import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    dataItems: {
      dataItemId: string;
      isRequired: boolean;
      isOptional: boolean;
      sourceDirectOrIndirect?: string;
      notes?: string;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step4DataItems({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: dataItemsCatalog } = useQuery({
    queryKey: ['catalogs', 'data-items'],
    queryFn: () => catalogService.getAll('data-items', user?.companyId),
  });

  const hasGlobalError = errors.some(e => e.includes('dato personal'));

  const addItem = () => {
    onChange({
      dataItems: [...values.dataItems, { dataItemId: '', isRequired: true, isOptional: false, sourceDirectOrIndirect: '', notes: '' }],
    });
  };

  const updateItem = (index: number, field: string, value: string | boolean) => {
    const updated = [...values.dataItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ dataItems: updated });
  };

  const removeItem = (index: number) => {
    const updated = values.dataItems.filter((_, i) => i !== index);
    onChange({ dataItems: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 4: Datos personales tratados</h3>
      <p className="text-sm text-gray-500">
        Art. 38.4 Reglamento LOPDP: Categorías de datos personales. Art. 10.d LOPDP: Principio de minimización — solo datos estrictamente necesarios.
        Res. SPDP-SPD-2026-0005-R: Categorías y tipos de datos personales tratados.
      </p>

      {values.dataItems.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          No hay datos registrados. Agregue al menos uno.
        </p>
      )}

      {values.dataItems.map((item, index) => {
        const itemError = errors.some(e => e.includes(`Dato #${index + 1}`));
        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Dato #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Dato específico *</label>
                <select
                  value={item.dataItemId}
                  onChange={(e) => updateItem(index, 'dataItemId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {dataItemsCatalog?.map((di) => (
                    <option key={di.id} value={di.id}>{di.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    onChange={(e) => updateItem(index, 'isRequired', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Obligatorio
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.isOptional}
                    onChange={(e) => updateItem(index, 'isOptional', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Opcional
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fuente</label>
                <select
                  value={item.sourceDirectOrIndirect || ''}
                  onChange={(e) => updateItem(index, 'sourceDirectOrIndirect', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="directa">Directa</option>
                  <option value="indirecta">Indirecta</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={item.notes || ''}
                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
      >
        + Agregar dato
      </button>
    </div>
  );
}
