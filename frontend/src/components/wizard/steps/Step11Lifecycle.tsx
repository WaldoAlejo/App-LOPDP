interface Props {
  values: any;
  onChange: (values: Partial<any>) => void;
}

export function Step11Lifecycle(_props: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 11: Ciclo de vida</h3>
      <p className="text-sm text-gray-500">(Configuración de fases disponible en edición avanzada)</p>
    </div>
  );
}
