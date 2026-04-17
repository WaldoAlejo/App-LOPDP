import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../../services/catalog.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    hasInternationalTransfers: boolean;
    internationalTransfers: {
      countryId: string;
      thirdPartyId?: string;
      destinationName?: string;
      transferredDataDescription?: string;
      purpose?: string;
      transferLegalBasis?: string;
      safeguards?: string;
      notes?: string;
    }[];
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step8Transfers({ values, onChange, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: countries } = useQuery({
    queryKey: ['catalogs', 'countries'],
    queryFn: () => catalogService.getAll('countries', user?.companyId),
  });
  const { data: thirdParties } = useQuery({
    queryKey: ['catalogs', 'third-parties'],
    queryFn: () => catalogService.getAll('third-parties', user?.companyId),
  });

  const hasGlobalError = errors.some((error) => error.includes('transferencia'));

  const setHasInternationalTransfers = (checked: boolean) => {
    onChange({
      hasInternationalTransfers: checked,
      internationalTransfers: checked ? values.internationalTransfers : [],
    });
  };

  const addTransfer = () => {
    onChange({
      internationalTransfers: [
        ...values.internationalTransfers,
        {
          countryId: '',
          thirdPartyId: '',
          destinationName: '',
          transferredDataDescription: '',
          purpose: '',
          transferLegalBasis: '',
          safeguards: '',
          notes: '',
        },
      ],
    });
  };

  const updateTransfer = (index: number, field: string, value: string) => {
    const updated = [...values.internationalTransfers];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ internationalTransfers: updated });
  };

  const removeTransfer = (index: number) => {
    onChange({ internationalTransfers: values.internationalTransfers.filter((_, currentIndex) => currentIndex !== index) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 8: Transferencias internacionales</h3>
      <p className="text-sm text-gray-500">
        Art. 38.6 Reglamento LOPDP: Transferencias internacionales. Art. 14-16 LOPDP: Requisitos para transferencias a terceros países.
        Res. SPDP-SPD-2026-0004-R: Norma General de Transferencias Nacionales e Internacionales.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.hasInternationalTransfers}
          onChange={(e) => setHasInternationalTransfers(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        ¿Existen transferencias internacionales de datos?
      </label>

      {!values.hasInternationalTransfers && (
        <p className="text-sm text-gray-500">No aplica para este tratamiento.</p>
      )}

      {values.hasInternationalTransfers && values.internationalTransfers.length === 0 && (
        <p className={`text-sm ${hasGlobalError ? 'text-red-600' : 'text-gray-500'}`}>
          Debe registrar al menos una transferencia internacional cuando el tratamiento la contemple.
        </p>
      )}

      {values.hasInternationalTransfers && values.internationalTransfers.map((item, index) => {
        const itemError = errors.some((error) => error.includes(`Transferencia #${index + 1}`));

        return (
          <div key={index} className={`rounded-lg border p-4 ${itemError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Transferencia #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeTransfer(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">País destino *</label>
                <select
                  value={item.countryId}
                  onChange={(e) => updateTransfer(index, 'countryId', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${itemError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
                >
                  <option value="">Seleccione...</option>
                  {countries?.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Proveedor o tercero</label>
                <select
                  value={item.thirdPartyId || ''}
                  onChange={(e) => updateTransfer(index, 'thirdPartyId', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seleccione...</option>
                  {thirdParties?.map((thirdParty) => (
                    <option key={thirdParty.id} value={thirdParty.id}>{thirdParty.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Destino identificado</label>
                <input
                  type="text"
                  value={item.destinationName || ''}
                  onChange={(e) => updateTransfer(index, 'destinationName', e.target.value)}
                  placeholder="Ej: AWS, proveedor internacional, matriz"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Datos transferidos *</label>
                <textarea
                  value={item.transferredDataDescription || ''}
                  onChange={(e) => updateTransfer(index, 'transferredDataDescription', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Finalidad *</label>
                <input
                  type="text"
                  value={item.purpose || ''}
                  onChange={(e) => updateTransfer(index, 'purpose', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Base de legitimación</label>
                <input
                  type="text"
                  value={item.transferLegalBasis || ''}
                  onChange={(e) => updateTransfer(index, 'transferLegalBasis', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Salvaguardas *</label>
              <textarea
                value={item.safeguards || ''}
                onChange={(e) => updateTransfer(index, 'safeguards', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={item.notes || ''}
                onChange={(e) => updateTransfer(index, 'notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        );
      })}

      {values.hasInternationalTransfers && (
        <button
          type="button"
          onClick={addTransfer}
          className="w-full rounded-md border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600"
        >
          + Agregar transferencia internacional
        </button>
      )}
    </div>
  );
}
