interface Props {
  values: any;
}

export function Step13Summary({ values }: Props) {
  const missing: string[] = [];
  if (!values.name) missing.push('Nombre del tratamiento');
  if (!values.mainPurpose) missing.push('Finalidad principal');
  if (!values.dataSubjects?.length) missing.push('Titulares');
  if (!values.dataItems?.length) missing.push('Datos personales');
  if (!values.legalBases?.length) missing.push('Bases legales');
  if (!values.retention?.activeRetentionPeriod) missing.push('Conservación');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 13: Resumen y envío</h3>

      {missing.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">Faltan campos obligatorios:</p>
          <ul className="mt-1 list-disc pl-5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {missing.length === 0 && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">¡Todo listo!</p>
          <p>El tratamiento cumple con los campos obligatorios mínimos y puede enviarse a revisión DPO.</p>
        </div>
      )}

      <div className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Vista previa</h4>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Código</dt>
            <dd className="font-medium text-gray-900">{values.code || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Nombre</dt>
            <dd className="font-medium text-gray-900">{values.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Titulares</dt>
            <dd className="font-medium text-gray-900">{values.dataSubjects?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Datos</dt>
            <dd className="font-medium text-gray-900">{values.dataItems?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Bases legales</dt>
            <dd className="font-medium text-gray-900">{values.legalBases?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Alto riesgo (autoevaluado)</dt>
            <dd className="font-medium text-gray-900">
              {values.riskAssessment?.usesSpecialCategories || values.riskAssessment?.automatedDecisions || values.riskAssessment?.potentialHighImpact ? 'Sí' : 'No'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
