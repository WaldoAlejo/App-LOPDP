interface Props {
  values: {
    hasInternationalTransfers: boolean;
    internationalTransfers: any[];
  };
  onChange: (values: Partial<any>) => void;
}

export function Step8Transfers({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 8: Transferencias internacionales</h3>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.hasInternationalTransfers}
          onChange={(e) => onChange({ hasInternationalTransfers: e.target.checked })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        ¿Existen transferencias internacionales de datos?
      </label>

      {!values.hasInternationalTransfers && (
        <p className="text-sm text-gray-500">No aplica para este tratamiento.</p>
      )}

      {values.hasInternationalTransfers && (
        <p className="text-sm text-gray-500">(Configuración de transferencias disponible en edición avanzada)</p>
      )}
    </div>
  );
}
