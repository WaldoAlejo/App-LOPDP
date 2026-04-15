interface Props {
  values: any;
  onChange: (values: Partial<any>) => void;
}

export function Step10Security(_props: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 10: Medidas de seguridad</h3>
      <p className="text-sm text-gray-500">(Selección de medidas disponible en edición avanzada)</p>
    </div>
  );
}
