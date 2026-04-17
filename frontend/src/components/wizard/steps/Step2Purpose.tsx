interface Props {
  values: {
    mainPurpose: string;
    secondaryPurposes?: string;
    originOfData?: string;
    dataCollectionChannel?: string;
    approximateVolume?: string;
    processingFrequency?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
  errors?: string[];
}

export function Step2Purpose({ values, onChange, errors = [] }: Props) {
  const hasError = (field: string) => errors.some((e) => e.toLowerCase().includes(field.toLowerCase()));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 2: Finalidad del tratamiento</h3>
      <p className="text-sm text-gray-500">
        Art. 38.2 Reglamento LOPDP: Fines del tratamiento. Los fines deben ser determinados, explícitos y legítimos (Art. 10.b LOPDP).
        Res. SPDP-SPD-2026-0005-R: Descripción del tratamiento, frecuencia y permanencia.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Finalidad principal del tratamiento *
        </label>
        <textarea
          value={values.mainPurpose}
          onChange={(e) => onChange({ mainPurpose: e.target.value })}
          rows={3}
          placeholder="Describa de manera clara y específica la finalidad principal por la que se tratan los datos personales..."
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('finalidad') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
        />
        {hasError('finalidad') && (
          <p className="mt-1 text-xs text-red-600">{errors.find((e) => e.toLowerCase().includes('finalidad'))}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Finalidades secundarias</label>
        <textarea
          value={values.secondaryPurposes || ''}
          onChange={(e) => onChange({ secondaryPurposes: e.target.value })}
          rows={2}
          placeholder="Otras finalidades compatibles con la principal..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Origen de los datos</label>
          <input
            type="text"
            value={values.originOfData || ''}
            onChange={(e) => onChange({ originOfData: e.target.value })}
            placeholder="Ej: Directamente del titular, terceros, fuentes públicas"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Canal de recolección</label>
          <input
            type="text"
            value={values.dataCollectionChannel || ''}
            onChange={(e) => onChange({ dataCollectionChannel: e.target.value })}
            placeholder="Ej: Web, app móvil, puntos de atención, call center"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Volumen aproximado de titulares</label>
          <input
            type="text"
            value={values.approximateVolume || ''}
            onChange={(e) => onChange({ approximateVolume: e.target.value })}
            placeholder="Ej: 50,000 registros mensuales"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Frecuencia del tratamiento</label>
          <input
            type="text"
            value={values.processingFrequency || ''}
            onChange={(e) => onChange({ processingFrequency: e.target.value })}
            placeholder="Ej: Diaria, semanal, mensual, por evento"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
