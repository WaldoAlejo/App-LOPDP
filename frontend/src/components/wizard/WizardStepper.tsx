import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

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

// Mapeo de sectionCode a índice de paso (1-based)
const sectionToStepMap: Record<string, number> = {
  identificacion: 1,
  finalidad: 2,
  titulares: 3,
  datos: 4,
  base_legal: 5,
  tecnologias: 6,
  terceros: 7,
  transferencias: 8,
  conservacion: 9,
  seguridad: 10,
  ciclo_vida: 11,
  riesgo: 12,
};

export interface ObservationInfo {
  sectionCode: string;
  status: string;
}

interface Props {
  currentStep: number;
  onStepSelect?: (step: number) => void;
  observations?: ObservationInfo[];
}

export function WizardStepper({ currentStep, onStepSelect, observations = [] }: Props) {
  // Contar observaciones abiertas por paso
  const openObservationsByStep = new Map<number, number>();
  for (const obs of observations) {
    if (obs.status === 'abierta') {
      const step = sectionToStepMap[obs.sectionCode];
      if (step) {
        openObservationsByStep.set(step, (openObservationsByStep.get(step) || 0) + 1);
      }
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 px-2 py-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const openCount = openObservationsByStep.get(stepNumber) || 0;
          const hasObservations = openCount > 0;

          return (
            <div key={stepNumber} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepSelect?.(stepNumber)}
                className={clsx(
                  'relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : hasObservations
                    ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                    : isCompleted
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-white text-primary-600'
                      : hasObservations
                      ? 'bg-red-500 text-white'
                      : isCompleted
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  )}
                >
                  {hasObservations ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
                {hasObservations && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {openCount}
                  </span>
                )}
                {isActive && !hasObservations && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
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
