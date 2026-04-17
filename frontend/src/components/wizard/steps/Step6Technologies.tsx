interface Props {
  values: {
    captureSystem?: string;
    storageSystem?: string;
    medium?: string;
    technologies?: string;
    linkedDocuments?: string;
    applications?: string;
    automatedProcessing?: boolean;
    profiling?: boolean;
    profilingDescription?: string;
    automatedDecisions?: boolean;
    automatedDecisionsDescription?: string;
    automatedDecisionsLogic?: string;
    automatedDecisionsConsequences?: string;
    humanInterventionAvailable?: boolean;
    usesAi?: boolean;
    aiSystemDescription?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
  errors?: string[];
}

export function Step6Technologies({ values, onChange, errors: _errors = [] }: Props) {
  const toggle = (field: keyof Props['values']) => {
    onChange({ [field]: !values[field] } as Partial<Props['values']>);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 6: Sistemas, soportes y tecnologías</h3>
      <p className="text-sm text-gray-500">
        Art. 38.9 Reglamento LOPDP: Medidas técnicas, jurídicas, administrativas y organizativas.
        Res. SPDP-SPD-2026-0009-R: Sistemas de IA y decisiones automatizadas.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sistema de captura</label>
          <input
            type="text"
            value={values.captureSystem || ''}
            onChange={(e) => onChange({ captureSystem: e.target.value })}
            placeholder="Ej: Formulario web, app móvil"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sistema de almacenamiento</label>
          <input
            type="text"
            value={values.storageSystem || ''}
            onChange={(e) => onChange({ storageSystem: e.target.value })}
            placeholder="Ej: PostgreSQL en GCP, AWS S3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Soporte físico/digital</label>
          <input
            type="text"
            value={values.medium || ''}
            onChange={(e) => onChange({ medium: e.target.value })}
            placeholder="Ej: Digital, papel, híbrido"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tecnologías usadas</label>
          <input
            type="text"
            value={values.technologies || ''}
            onChange={(e) => onChange({ technologies: e.target.value })}
            placeholder="Ej: React, Node.js, TensorFlow"
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
          placeholder="Políticas, procedimientos, manuales relacionados"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Aplicativos involucrados</label>
        <textarea
          value={values.applications || ''}
          onChange={(e) => onChange({ applications: e.target.value })}
          rows={2}
          placeholder="Sistemas o aplicaciones que intervienen en el tratamiento"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Flags de procesamiento automatizado, perfilamiento, decisiones automatizadas e IA */}
      <div className="rounded-md border border-gray-200 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Características especiales del tratamiento</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={values.automatedProcessing || false}
              onChange={() => toggle('automatedProcessing')}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>¿El tratamiento es automatizado?</span>
          </label>

          <label className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={values.profiling || false}
              onChange={() => toggle('profiling')}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>¿Incluye perfilamiento? (Art. 38.5)</span>
          </label>

          <label className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={values.automatedDecisions || false}
              onChange={() => toggle('automatedDecisions')}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>¿Incluye decisiones automatizadas? (Res. 0009-R)</span>
          </label>

          <label className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={values.usesAi || false}
              onChange={() => toggle('usesAi')}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>¿Usa sistemas de Inteligencia Artificial? (Res. 0009-R)</span>
          </label>
        </div>
      </div>

      {/* Descripción del perfilamiento */}
      {values.profiling && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-900">Descripción del perfilamiento (Art. 38.5)</p>
          <textarea
            value={values.profilingDescription || ''}
            onChange={(e) => onChange({ profilingDescription: e.target.value })}
            rows={3}
            placeholder="Describa la finalidad del perfilamiento, categorías de datos utilizados y consecuencias para el titular..."
            className="mt-2 w-full rounded-md border border-yellow-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      )}

      {/* Descripción de decisiones automatizadas */}
      {values.automatedDecisions && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">Detalle de decisiones automatizadas (Res. SPDP-SPD-2026-0009-R)</p>
          <div className="mt-2 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-red-800">Descripción general</label>
              <textarea
                value={values.automatedDecisionsDescription || ''}
                onChange={(e) => onChange({ automatedDecisionsDescription: e.target.value })}
                rows={2}
                placeholder="Describa el tipo de decisiones automatizadas que se toman..."
                className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-red-800">Lógica del algoritmo / sistema</label>
              <textarea
                value={values.automatedDecisionsLogic || ''}
                onChange={(e) => onChange({ automatedDecisionsLogic: e.target.value })}
                rows={2}
                placeholder="Describa la lógica, criterios o reglas que utiliza el sistema..."
                className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-red-800">Consecuencias para el titular</label>
              <textarea
                value={values.automatedDecisionsConsequences || ''}
                onChange={(e) => onChange({ automatedDecisionsConsequences: e.target.value })}
                rows={2}
                placeholder="Describa las consecuencias jurídicas o significativas para el titular..."
                className="w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.humanInterventionAvailable || false}
                onChange={() => toggle('humanInterventionAvailable')}
                className="mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-red-800">¿Existe derecho a intervención humana?</span>
            </label>
          </div>
        </div>
      )}

      {/* Descripción del sistema de IA */}
      {values.usesAi && (
        <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-900">Descripción del sistema de IA (Res. SPDP-SPD-2026-0009-R)</p>
          <textarea
            value={values.aiSystemDescription || ''}
            onChange={(e) => onChange({ aiSystemDescription: e.target.value })}
            rows={3}
            placeholder="Describa el sistema de IA: tipo de modelo, datos de entrenamiento, finalidad, riesgos identificados, medidas de mitigación..."
            className="mt-2 w-full rounded-md border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      )}
    </div>
  );
}
