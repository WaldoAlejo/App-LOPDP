interface Props {
  values: any;
  errors?: string[];
}

export function Step13Summary({ values, errors = [] }: Props) {
  const missing: string[] = [];
  if (!values.name) missing.push('Nombre del tratamiento');
  if (!values.mainPurpose) missing.push('Finalidad principal');
  if (!values.dataSubjects?.length) missing.push('Titulares');
  if (!values.dataItems?.length) missing.push('Datos personales');
  if (!values.legalBases?.length) missing.push('Bases legales');
  if (!values.retention?.activeRetentionPeriod) missing.push('Conservación');
  if (!values.securityMeasures?.length) missing.push('Medidas de seguridad');
  if (values.profiling && !values.profilingDescription) missing.push('Descripción del perfilamiento');
  if (values.automatedDecisions && !values.automatedDecisionsDescription) missing.push('Descripción de decisiones automatizadas');
  if (values.automatedDecisions && !values.automatedDecisionsLogic) missing.push('Lógica de decisiones automatizadas');
  if (values.automatedDecisions && !values.automatedDecisionsConsequences) missing.push('Consecuencias de decisiones automatizadas');
  if (values.automatedDecisions && !values.humanInterventionAvailable) missing.push('Intervención humana en decisiones automatizadas');
  if (values.usesAi && !values.aiSystemDescription) missing.push('Descripción del sistema de IA');

  const hasHighRisk = values.riskAssessment?.usesSpecialCategories ||
    values.riskAssessment?.automatedDecisions ||
    values.riskAssessment?.potentialHighImpact ||
    values.riskAssessment?.largeScale ||
    values.riskAssessment?.biometricData ||
    values.riskAssessment?.healthData;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 13: Resumen y envío</h3>
      <p className="text-sm text-gray-500">
        Revise la información antes de enviar el RAT a revisión DPO. El Registro de Actividades de Tratamiento debe cumplir con el Art. 38 del Reglamento LOPDP.
      </p>

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

      {missing.length === 0 && errors.length === 0 && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">¡Todo listo!</p>
          <p>El tratamiento cumple con los campos mínimos y con las exigencias reforzadas para perfilamiento, decisiones automatizadas e IA.</p>
        </div>
      )}

      <div className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Vista previa del RAT</h4>
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
            <dt className="text-gray-500">Responsable operativo</dt>
            <dd className="font-medium text-gray-900">{values.treatmentResponsibleUserId ? 'Asignado' : 'No asignado'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">DPO</dt>
            <dd className="font-medium text-gray-900">{values.dpoName || values.dpoId ? (values.dpoName || 'Asignado') : 'No asignado'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Corresponsable</dt>
            <dd className="font-medium text-gray-900">{values.jointControllerName || 'No aplica'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Titulares</dt>
            <dd className="font-medium text-gray-900">{values.dataSubjects?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Datos personales</dt>
            <dd className="font-medium text-gray-900">{values.dataItems?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Bases legales</dt>
            <dd className="font-medium text-gray-900">{values.legalBases?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Terceros / Destinatarios</dt>
            <dd className="font-medium text-gray-900">{values.thirdParties?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Transferencias internacionales</dt>
            <dd className="font-medium text-gray-900">{values.internationalTransfers?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Fases del ciclo de vida</dt>
            <dd className="font-medium text-gray-900">{values.lifecycle?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Medidas de seguridad</dt>
            <dd className="font-medium text-gray-900">{values.securityMeasures?.length || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Perfilamiento</dt>
            <dd className="font-medium text-gray-900">{values.profiling ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Decisiones automatizadas</dt>
            <dd className="font-medium text-gray-900">{values.automatedDecisions ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Usa IA</dt>
            <dd className="font-medium text-gray-900">{values.usesAi ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Gran escala</dt>
            <dd className="font-medium text-gray-900">{values.largeScaleProcessing ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Alto riesgo (autoevaluado)</dt>
            <dd className="font-medium text-gray-900">{hasHighRisk ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Requiere EIPD</dt>
            <dd className="font-medium text-gray-900">{values.requiresDpia ? 'Sí' : 'No'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
