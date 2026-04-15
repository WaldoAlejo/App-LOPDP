import { useState } from 'react';

const TOTAL_STEPS = 13;

export function useWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === TOTAL_STEPS,
  };
}
