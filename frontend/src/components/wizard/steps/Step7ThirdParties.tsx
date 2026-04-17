import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    hasThirdParties: boolean;
    thirdParties: {
      thirdPartyId: string;
      accessPurpose?: string;
      accessedDataDescription?: string;
      involvedDataSubjects?: string;
      transferOutsideCountry: boolean;
      notes?: string;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step7ThirdParties({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: thirdPartiesCatalog } = useQuery({
    queryKey: ['catalogs', 'third-parties'],
    queryFn: () => catalogService.getAll('third-parties', user?.companyId),
  });

  const hasGlobalError = errors.some((error) => error.includes('tercero'));

  const setHasThirdParties = (checked: boolean) => {
    onChange({
      hasThirdParties: checked,
      thirdParties: checked ? values.thirdParties : [],
    });
  };

  const addThirdParty = () => {
    onChange({
      thirdParties: [
        ...values.thirdParties,
        {
          thirdPartyId: '',
          accessPurpose: '',
          accessedDataDescription: '',
          involvedDataSubjects: '',
          transferOutsideCountry: false,
          notes: '',
        },
      ],
    });
  };

  const updateThirdParty = (index: number, field: string, value: string | boolean) => {
    const updated = [...values.thirdParties];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ thirdParties: updated });
  };

  const removeThirdParty = (index: number) => {
    onChange({ thirdParties: values.thirdParties.filter((_, currentIndex) => currentIndex !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 7: Terceros, encargados y destinatarios</h3>
      <p className="text-sm text-gray-500">
        Art. 38.3 Reglamento LOPDP: Categorías de destinatarios. Art. 37 Reglamento LOPDP: Contratos con encargados del tratamiento.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.hasThirdParties}
          onChange={(e) => setHasThirdParties(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        ¿Comparte datos con terceros?
      </label>

      {!values.hasThirdParties && (
        <p className="text-sm text-gray-500">No aplica para este tratamiento.</p>
      )}

      {values.hasThirdParties && values.thirdParties.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          Debe registrar al menos un tercero, encargado o destinatario.
        </p>
      )}

      {values.hasThirdParties && values.thirdParties.map((item, index) => {
        const itemError = errors.some((error) => error.includes(`Tercero #${index + 1}`));

        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Tercero #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeThirdParty(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Tercero o destinatario *</label>
                <select
                  value={item.thirdPartyId}
                  onChange={(e) => updateThirdParty(index, 'thirdPartyId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {thirdPartiesCatalog?.map((thirdParty) => (
                    <option key={thirdParty.id} value={thirdParty.id}>{thirdParty.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Finalidad del acceso *</label>
                <input
                  type="text"
                  value={item.accessPurpose || ''}
                  onChange={(e) => updateThirdParty(index, 'accessPurpose', e.target.value)}
                  placeholder="Ej: logística, soporte, alojamiento"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Titulares involucrados</label>
                <input
                  type="text"
                  value={item.involvedDataSubjects || ''}
                  onChange={(e) => updateThirdParty(index, 'involvedDataSubjects', e.target.value)}
                  placeholder="Ej: clientes, colaboradores"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Datos a los que accede *</label>
              <textarea
                value={item.accessedDataDescription || ''}
                onChange={(e) => updateThirdParty(index, 'accessedDataDescription', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.transferOutsideCountry}
                  onChange={(e) => updateThirdParty(index, 'transferOutsideCountry', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Implica transferencia fuera del país
              </label>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={item.notes || ''}
                onChange={(e) => updateThirdParty(index, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      {values.hasThirdParties && (
        <button
          type="button"
          onClick={addThirdParty}
          className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
        >
          + Agregar tercero
        </button>
      )}
    </div>
  );
}
