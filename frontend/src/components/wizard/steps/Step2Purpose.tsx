import { useState } from 'react';
import { Plus, Trash2, HelpCircle, Lightbulb } from 'lucide-react';

interface Props {
  values: {
    mainPurpose: string;
    secondaryPurposes?: string;
    originOfData?: string;
    dataCollectionChannel?: string;
    approximateVolume?: string;
    processingFrequency?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
  errors?: string[];
}

function HelpTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle size={14} className="text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-72 -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
        {text}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

const ORIGIN_OPTIONS = [
  'Directamente del titular (la persona misma nos dio sus datos)',
  'Terceros (otra empresa o persona nos dio los datos)',
  'Fuentes públicas (registros públicos, redes sociales públicas)',
  'Cámaras de video vigilancia',
  'Dispositivos IoT (GPS, sensores, wearables)',
  'Cookies y tecnologías de seguimiento web',
  'Bases de datos adquiridas comercialmente',
  'Herencia de procesos anteriores',
];

export function Step2Purpose({ values, onChange, errors = [] }: Props) {
  const hasError = (field: string) => errors.some((e) => e.toLowerCase().includes(field.toLowerCase()));
  const [customOrigins, setCustomOrigins] = useState<string[]>(
    values.originOfData 
      ? values.originOfData.split('; ').filter(o => !ORIGIN_OPTIONS.includes(o) && o.trim())
      : []
  );
  const [newOrigin, setNewOrigin] = useState('');
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(
    values.originOfData 
      ? values.originOfData.split('; ').filter(o => ORIGIN_OPTIONS.includes(o) || customOrigins.includes(o))
      : []
  );

  const toggleOrigin = (origin: string) => {
    const newSelected = selectedOrigins.includes(origin)
      ? selectedOrigins.filter(o => o !== origin)
      : [...selectedOrigins, origin];
    setSelectedOrigins(newSelected);
    onChange({ originOfData: newSelected.join('; ') });
  };

  const addCustomOrigin = () => {
    if (newOrigin.trim() && !customOrigins.includes(newOrigin.trim())) {
      const updated = [...customOrigins, newOrigin.trim()];
      setCustomOrigins(updated);
      const newSelected = [...selectedOrigins, newOrigin.trim()];
      setSelectedOrigins(newSelected);
      onChange({ originOfData: newSelected.join('; ') });
      setNewOrigin('');
    }
  };

  const removeCustomOrigin = (origin: string) => {
    setCustomOrigins(customOrigins.filter(o => o !== origin));
    const newSelected = selectedOrigins.filter(o => o !== origin);
    setSelectedOrigins(newSelected);
    onChange({ originOfData: newSelected.join('; ') });
  };

  return (
    <div className="space-y-5">
      {/* Título con explicación simple */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Paso 2: ¿Para qué usamos los datos?</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aquí explicamos el propósito de usar los datos personales. Es como decir: "Necesitamos tu dirección para poder entregarte tu pedido."
        </p>
      </div>

      {/* Info box explicativo */}
      <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
        <p className="text-sm text-amber-800">
          <strong>💡 Importante:</strong> La ley dice que solo podemos usar los datos para lo que dijimos que los íbamos a usar. 
          No podemos usarlos para otra cosa sin avisarle a la persona. Es como si te pidieran tu dirección para enviarte un regalo, 
          no pueden usarla para mandarte publicidad sin tu permiso.
        </p>
      </div>

      {/* Finalidad principal */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Finalidad principal del tratamiento *
          <HelpTooltip text="La razón PRINCIPAL por la que necesitamos los datos. Debe ser clara y específica. Ejemplo: 'Entregar los pedidos de los clientes a la dirección correcta'." />
        </label>
        <div className="rounded-md bg-blue-50 border border-blue-100 p-3 mb-2">
          <p className="text-xs text-blue-700">
            <Lightbulb size={12} className="inline mr-1" />
            <strong>Ejemplo:</strong> "Gestionar el envío de productos comprados por nuestros clientes, 
            incluyendo la preparación del pedido, asignación de transporte y entrega en la dirección indicada."
          </p>
        </div>
        <textarea
          value={values.mainPurpose}
          onChange={(e) => onChange({ mainPurpose: e.target.value })}
          rows={4}
          placeholder="Describe la razón principal por la que necesitas estos datos personales. Sé específico y claro."
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('finalidad') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
        />
        {hasError('finalidad') && (
          <p className="mt-1 text-xs text-red-600">{errors.find((e) => e.toLowerCase().includes('finalidad'))}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          💡 <strong>Consejo:</strong> Imagina que le estás explicando a un niño de 10 años por qué necesitas sus datos. 
          Usa palabras simples y evita tecnicismos.
        </p>
      </div>

      {/* Finalidades secundarias */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Finalidades secundarias (opcional)
          <HelpTooltip text="Otras razones relacionadas con la principal por las que también usamos los datos. Deben ser compatibles con la finalidad principal." />
        </label>
        <div className="rounded-md bg-gray-50 border border-gray-100 p-3 mb-2">
          <p className="text-xs text-gray-600">
            <Lightbulb size={12} className="inline mr-1" />
            <strong>¿Qué son?</strong> Son usos ADICIONALES que están relacionados con el propósito principal. 
            Por ejemplo, si la finalidad principal es "enviar pedidos", una secundaria podría ser 
            "contactar al cliente si hay un problema con la entrega".
          </p>
        </div>
        <textarea
          value={values.secondaryPurposes || ''}
          onChange={(e) => onChange({ secondaryPurposes: e.target.value })}
          rows={3}
          placeholder="Ej: Contactar al cliente en caso de incidencias con la entrega; enviar notificaciones sobre el estado del envío."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Si no hay finalidades secundarias, deja este campo vacío.
        </p>
      </div>

      {/* Origen de los datos - TABLA MEJORADA */}
      <div className="rounded-lg border border-gray-200 p-4">
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          📍 ¿De dónde vienen los datos?
          <HelpTooltip text="Indica cómo obtuvimos los datos personales. ¿La persona nos los dio directamente? ¿Los obtuvimos de otra empresa? ¿De una fuente pública?" />
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Selecciona una o más opciones. Si no encuentras la opción correcta, puedes agregarla.
        </p>

        <div className="space-y-2">
          {ORIGIN_OPTIONS.map((origin) => (
            <label key={origin} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedOrigins.includes(origin)}
                onChange={() => toggleOrigin(origin)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{origin}</span>
            </label>
          ))}
          
          {/* Orígenes personalizados */}
          {customOrigins.map((origin) => (
            <label key={origin} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedOrigins.includes(origin)}
                onChange={() => toggleOrigin(origin)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 flex-1">{origin}</span>
              <button
                onClick={() => removeCustomOrigin(origin)}
                className="text-red-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </label>
          ))}
        </div>

        {/* Agregar origen personalizado */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="Agregar otro origen de datos..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomOrigin())}
          />
          <button
            onClick={addCustomOrigin}
            disabled={!newOrigin.trim()}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Canal de recolección */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Canal de recolección
          <HelpTooltip text="¿Cómo o dónde recogemos los datos? Ejemplo: página web, app móvil, formulario en papel, llamada telefónica." />
        </label>
        <input
          type="text"
          value={values.dataCollectionChannel || ''}
          onChange={(e) => onChange({ dataCollectionChannel: e.target.value })}
          placeholder="Ej: Formulario web, app móvil, puntos de atención, call center"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Volumen aproximado de titulares
            <HelpTooltip text="¿Aproximadamente cuántas personas están involucradas? Puedes poner un número estimado." />
          </label>
          <input
            type="text"
            value={values.approximateVolume || ''}
            onChange={(e) => onChange({ approximateVolume: e.target.value })}
            placeholder="Ej: 50,000 registros mensuales"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Frecuencia del tratamiento
            <HelpTooltip text="¿Con qué frecuencia usamos o actualizamos estos datos? Ejemplo: cada vez que un cliente hace un pedido, diariamente, mensualmente." />
          </label>
          <input
            type="text"
            value={values.processingFrequency || ''}
            onChange={(e) => onChange({ processingFrequency: e.target.value })}
            placeholder="Ej: Diaria, semanal, mensual, por evento"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
