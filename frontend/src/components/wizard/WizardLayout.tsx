import type { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { WizardStepper } from './WizardStepper';

interface Props {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onStepSelect?: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSaveDraft: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepErrors?: string[];
  isSaving?: boolean;
}

export function WizardLayout({
  currentStep,
  children,
  onStepSelect,
  onNext,
  onPrev,
  onSaveDraft,
  isFirstStep,
  isLastStep,
  stepErrors = [],
  isSaving = false,
}: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <WizardStepper currentStep={currentStep} onStepSelect={onStepSelect} />

      <div className="rounded-xl bg-white p-6 shadow-sm">
        {stepErrors.length > 0 && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Por favor corrija los siguientes errores antes de continuar:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-red-700">
                  {stepErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {children}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {isSaving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</span> : 'Guardar borrador'}
        </button>

        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              disabled={isSaving}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Anterior
            </button>
          )}
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isSaving}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={isSaving}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSaving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</span> : 'Enviar a revisión'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
