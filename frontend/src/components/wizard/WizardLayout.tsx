import type { ReactNode } from 'react';
import { WizardStepper } from './WizardStepper';

interface Props {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onNext: () => void;
  onPrev: () => void;
  onSaveDraft: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function WizardLayout({
  currentStep,
  children,
  onNext,
  onPrev,
  onSaveDraft,
  isFirstStep,
  isLastStep,
}: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <WizardStepper currentStep={currentStep} />

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {children}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Guardar borrador
        </button>

        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Anterior
            </button>
          )}
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Enviar a revisión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
