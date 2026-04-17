interface Props {
  values: {
    retention: {
      retentionRuleId?: string;
      activeRetentionPeriod?: string;
      retentionCriteria?: string;
      legalOrContractualBasis?: string;
      blockingApplies: boolean;
      anonymizationApplies: boolean;
      deletionApplies: boolean;
      deletionMethod?: string;
      reviewFrequency?: string;
      responsibleRole?: string;
      notes?: string;
    };
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

export function Step9Retention({ values, onChange, errors = [] }: Props) {
  const update = (field: string, value: any) => {
    onChange({ retention: { ...values.retention, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 9: Conservación y plazos de retención</h3>
      <p className="text-sm text-gray-500">
        Art. 38.8 Reglamento LOPDP: Plazos de conservación. Art. 10.i LOPDP: Principio de limitación del plazo de conservación.
        Res. SPDP-SPD-2026-0005-R: Permanencia del tratamiento.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Plazo de conservación activa</label>
          <input
            type="text"
            value={values.retention.activeRetentionPeriod || ''}
            onChange={(e) => update('activeRetentionPeriod', e.target.value)}
            placeholder="Ej: 5 años"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.some(e => e.includes('retención')) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Criterio de conservación</label>
          <input
            type="text"
            value={values.retention.retentionCriteria || ''}
            onChange={(e) => update('retentionCriteria', e.target.value)}
            placeholder="Ej: Finalización del contrato"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Base legal o contractual</label>
        <textarea
          value={values.retention.legalOrContractualBasis || ''}
          onChange={(e) => update('legalOrContractualBasis', e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.retention.blockingApplies}
            onChange={(e) => update('blockingApplies', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Aplica bloqueo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.retention.anonymizationApplies}
            onChange={(e) => update('anonymizationApplies', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Aplica anonimización
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.retention.deletionApplies}
            onChange={(e) => update('deletionApplies', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Aplica eliminación
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Método de eliminación</label>
          <input
            type="text"
            value={values.retention.deletionMethod || ''}
            onChange={(e) => update('deletionMethod', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Frecuencia de revisión</label>
          <input
            type="text"
            value={values.retention.reviewFrequency || ''}
            onChange={(e) => update('reviewFrequency', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
