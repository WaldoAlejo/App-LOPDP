interface Props {
  values: {
    riskAssessment: {
      usesSpecialCategories: boolean;
      involvesChildren: boolean;
      largeScale: boolean;
      systematicMonitoring: boolean;
      profiling: boolean;
      automatedDecisions: boolean;
      videoSurveillance: boolean;
      geolocation: boolean;
      biometricData: boolean;
      healthData: boolean;
      criminalData: boolean;
      crossBorderTransfer: boolean;
      potentialHighImpact: boolean;
    };
  };
  onChange: (values: Partial<any>) => void;
  errors?: string[];
}

const questions = [
  { key: 'usesSpecialCategories', label: '¿Trata datos especiales (salud, biometricos, etc.)?' },
  { key: 'involvesChildren', label: '¿Involucra datos de menores?' },
  { key: 'biometricData', label: '¿Usa datos biometricos?' },
  { key: 'healthData', label: '¿Usa datos de salud?' },
  { key: 'criminalData', label: '¿Usa datos judiciales/penales?' },
  { key: 'videoSurveillance', label: '¿Hay videovigilancia?' },
  { key: 'profiling', label: '¿Hay perfilamiento?' },
  { key: 'automatedDecisions', label: '¿Hay decisiones automatizadas?' },
  { key: 'systematicMonitoring', label: '¿Hay monitoreo sistematico?' },
  { key: 'crossBorderTransfer', label: '¿Hay transferencia internacional?' },
  { key: 'largeScale', label: '¿Hay gran escala?' },
  { key: 'potentialHighImpact', label: '¿Puede afectar significativamente al titular?' },
];

export function Step12Risk({ values, onChange, errors: _errors = [] }: Props) {
  const update = (field: string, value: boolean) => {
    onChange({ riskAssessment: { ...values.riskAssessment, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 12: Evaluación preliminar de riesgo</h3>
      <p className="text-sm text-gray-500">
        Art. 40 LOPDP y Art. 41 Reglamento LOPDP: Evaluación de impacto en la protección de datos (EIPD) obligatoria para tratamientos de alto riesgo.
        Res. SPDP-SPD-2026-0005-R: Tratamientos a gran escala. Res. SPDP-SPD-2026-0009-R: Sistemas de IA.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {questions.map((q) => (
          <label key={q.key} className="flex items-start gap-2 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              checked={(values.riskAssessment as any)[q.key]}
              onChange={(e) => update(q.key, e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>{q.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
