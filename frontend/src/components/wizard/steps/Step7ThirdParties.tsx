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
}

export function Step7ThirdParties({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 7: Terceros, encargados y destinatarios</h3>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.hasThirdParties}
          onChange={(e) => onChange({ hasThirdParties: e.target.checked })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        ¿Comparte datos con terceros?
      </label>

      {!values.hasThirdParties && (
        <p className="text-sm text-gray-500">No aplica para este tratamiento.</p>
      )}

      {values.hasThirdParties && (
        <p className="text-sm text-gray-500">(Configuración de terceros disponible en edición avanzada)</p>
      )}
    </div>
  );
}
