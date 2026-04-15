import { clsx } from 'clsx';

const steps = [
  'Identificación',
  'Finalidad',
  'Titulares',
  'Datos',
  'Base legal',
  'Tecnologías',
  'Terceros',
  'Transferencias',
  'Conservación',
  'Seguridad',
  'Ciclo de vida',
  'Riesgo',
  'Resumen',
];

interface Props {
  currentStep: number;
}

export function WizardStepper({ currentStep }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 px-2 py-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <button
                className={clsx(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isCompleted
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <span
                  className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-white text-primary-600'
                      : isCompleted
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  )}
                >
                  {stepNumber}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {stepNumber < steps.length && (
                <div
                  className={clsx(
                    'mx-1 h-0.5 w-4',
                    isCompleted ? 'bg-primary-300' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
