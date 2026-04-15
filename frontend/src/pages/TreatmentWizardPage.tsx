import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { WizardLayout } from '../components/wizard/WizardLayout';
import { useWizard } from '../modules/treatments/useWizard';
import { Step1Identification } from '../components/wizard/steps/Step1Identification';
import { Step2Purpose } from '../components/wizard/steps/Step2Purpose';
import { Step3DataSubjects } from '../components/wizard/steps/Step3DataSubjects';
import { Step4DataItems } from '../components/wizard/steps/Step4DataItems';
import { Step5LegalBasis } from '../components/wizard/steps/Step5LegalBasis';
import { Step6Technologies } from '../components/wizard/steps/Step6Technologies';
import { Step7ThirdParties } from '../components/wizard/steps/Step7ThirdParties';
import { Step8Transfers } from '../components/wizard/steps/Step8Transfers';
import { Step9Retention } from '../components/wizard/steps/Step9Retention';
import { Step10Security } from '../components/wizard/steps/Step10Security';
import { Step11Lifecycle } from '../components/wizard/steps/Step11Lifecycle';
import { Step12Risk } from '../components/wizard/steps/Step12Risk';
import { Step13Summary } from '../components/wizard/steps/Step13Summary';
import { treatmentService } from '../services/treatment.service';


const emptyForm = {
  companyId: '',
  areaId: '',
  processId: '',
  code: '',
  name: '',
  shortDescription: '',
  mainPurpose: '',
  secondaryPurposes: '',
  originOfData: '',
  dataCollectionChannel: '',
  approximateVolume: '',
  processingFrequency: '',
  dataSubjects: [],
  dataItems: [],
  legalBases: [],
  captureSystem: '',
  storageSystem: '',
  medium: '',
  technologies: '',
  linkedDocuments: '',
  applications: '',
  hasThirdParties: false,
  thirdParties: [],
  hasInternationalTransfers: false,
  internationalTransfers: [],
  retention: {
    activeRetentionPeriod: '',
    retentionCriteria: '',
    legalOrContractualBasis: '',
    blockingApplies: false,
    anonymizationApplies: false,
    deletionApplies: false,
    deletionMethod: '',
    reviewFrequency: '',
    responsibleRole: '',
    notes: '',
  },
  securityMeasures: [],
  lifecycle: [],
  riskAssessment: {
    usesSpecialCategories: false,
    involvesChildren: false,
    largeScale: false,
    systematicMonitoring: false,
    profiling: false,
    automatedDecisions: false,
    videoSurveillance: false,
    geolocation: false,
    biometricData: false,
    healthData: false,
    criminalData: false,
    crossBorderTransfer: false,
    potentialHighImpact: false,
  },
  automatedProcessing: false,
  profiling: false,
  automatedDecisions: false,
  usesAi: false,
  largeScaleProcessing: false,
  internationalTransfer: false,
};

export function TreatmentWizardPage() {
  const navigate = useNavigate();
  const { currentStep, totalSteps, nextStep, prevStep, isFirstStep, isLastStep } = useWizard();
  const [form, setForm] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: treatmentService.create,
    onSuccess: (data) => {
      if (isLastStep) {
        treatmentService.changeStatus(data.id, 'enviado').then(() => {
          navigate('/treatments');
        });
      } else {
        navigate('/treatments');
      }
    },
  });

  const handleSaveDraft = () => {
    const payload = {
      companyId: form.companyId,
      areaId: form.areaId,
      processId: form.processId,
      code: form.code,
      name: form.name,
      shortDescription: form.shortDescription,
      mainPurpose: form.mainPurpose,
      secondaryPurposes: form.secondaryPurposes,
      originOfData: form.originOfData,
      dataCollectionChannel: form.dataCollectionChannel,
      approximateVolume: form.approximateVolume,
      processingFrequency: form.processingFrequency,
      automatedProcessing: form.automatedProcessing,
      profiling: form.profiling,
      automatedDecisions: form.automatedDecisions,
      usesAi: form.usesAi,
      largeScaleProcessing: form.largeScaleProcessing,
      internationalTransfer: form.internationalTransfer || form.hasInternationalTransfers,
    };
    createMutation.mutate(payload as any);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSaveDraft();
    } else {
      nextStep();
    }
  };

  const updateForm = (values: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...values }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identification values={form} onChange={updateForm} />;
      case 2:
        return <Step2Purpose values={form} onChange={updateForm} />;
      case 3:
        return <Step3DataSubjects values={form} onChange={updateForm} />;
      case 4:
        return <Step4DataItems values={form} onChange={updateForm} />;
      case 5:
        return <Step5LegalBasis values={form} onChange={updateForm} />;
      case 6:
        return <Step6Technologies values={form} onChange={updateForm} />;
      case 7:
        return <Step7ThirdParties values={form} onChange={updateForm} />;
      case 8:
        return <Step8Transfers values={form} onChange={updateForm} />;
      case 9:
        return <Step9Retention values={form} onChange={updateForm} />;
      case 10:
        return <Step10Security values={form} onChange={updateForm} />;
      case 11:
        return <Step11Lifecycle values={form} onChange={updateForm} />;
      case 12:
        return <Step12Risk values={form} onChange={updateForm} />;
      case 13:
        return <Step13Summary values={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <WizardLayout
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrev={prevStep}
        onSaveDraft={handleSaveDraft}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      >
        {renderStep()}
      </WizardLayout>
    </div>
  );
}
