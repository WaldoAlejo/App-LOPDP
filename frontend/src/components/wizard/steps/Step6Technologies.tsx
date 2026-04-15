interface Props {
  values: {
    captureSystem?: string;
    storageSystem?: string;
    medium?: string;
    technologies?: string;
    linkedDocuments?: string;
    applications?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
}

export function Step6Technologies({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 6: Sistemas, soportes y tecnologías</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sistema de captura</label>
          <input
            type="text"
            value={values.captureSystem || ''}
            onChange={(e) => onChange({ captureSystem: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sistema de almacenamiento</label>
          <input
            type="text"
            value={values.storageSystem || ''}
            onChange={(e) => onChange({ storageSystem: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Soporte físico/digital</label>
          <input
            type="text"
            value={values.medium || ''}
            onChange={(e) => onChange({ medium: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tecnologías usadas</label>
          <input
            type="text"
            value={values.technologies || ''}
            onChange={(e) => onChange({ technologies: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Documentos vinculados</label>
        <textarea
          value={values.linkedDocuments || ''}
          onChange={(e) => onChange({ linkedDocuments: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Aplicativos involucrados</label>
        <textarea
          value={values.applications || ''}
          onChange={(e) => onChange({ applications: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}
