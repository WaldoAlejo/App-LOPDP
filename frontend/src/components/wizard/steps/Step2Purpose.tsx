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
}

export function Step2Purpose({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 2: Finalidad</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Finalidad principal *</label>
        <textarea
          value={values.mainPurpose}
          onChange={(e) => onChange({ mainPurpose: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Finalidades secundarias</label>
        <textarea
          value={values.secondaryPurposes || ''}
          onChange={(e) => onChange({ secondaryPurposes: e.target.value })}
          rows={2}
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
            placeholder="Ej: Directamente del titular"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Canal de recolección</label>
          <input
            type="text"
            value={values.dataCollectionChannel || ''}
            onChange={(e) => onChange({ dataCollectionChannel: e.target.value })}
            placeholder="Ej: Web, app, puntos de atención"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Volumen aproximado</label>
          <input
            type="text"
            value={values.approximateVolume || ''}
            onChange={(e) => onChange({ approximateVolume: e.target.value })}
            placeholder="Ej: 50,000 registros mensuales"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Frecuencia de tratamiento</label>
          <input
            type="text"
            value={values.processingFrequency || ''}
            onChange={(e) => onChange({ processingFrequency: e.target.value })}
            placeholder="Ej: Diaria"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
