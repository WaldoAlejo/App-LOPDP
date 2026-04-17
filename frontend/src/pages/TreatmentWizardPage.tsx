import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { treatmentService, type Treatment } from '../services/treatment.service';

export interface WizardForm {
  companyId: string;
  areaId: string;
  processId: string;
  code: string;
  name: string;
  shortDescription: string;
  mainPurpose: string;
  secondaryPurposes: string;
  originOfData: string;
  dataCollectionChannel: string;
  approximateVolume: string;
  processingFrequency: string;
  dataSubjects: { dataSubjectTypeId: string; approximateCount?: string; sourceType?: string; relationshipWithCompany?: string; notes?: string }[];
  dataItems: { dataItemId: string; isRequired: boolean; isOptional: boolean; sourceDirectOrIndirect?: string; notes?: string }[];
  legalBases: { legalBasisId: string; justification?: string; isMainBasis: boolean }[];
  captureSystem: string;
  storageSystem: string;
  medium: string;
  technologies: string;
  linkedDocuments: string;
  applications: string;
  hasThirdParties: boolean;
  thirdParties: {
    thirdPartyId: string;
    accessPurpose?: string;
    accessedDataDescription?: string;
    involvedDataSubjects?: string;
    transferOutsideCountry: boolean;
    notes?: string;
  }[];
  hasInternationalTransfers: boolean;
  internationalTransfers: {
    countryId: string;
    thirdPartyId?: string;
    destinationName?: string;
    transferredDataDescription?: string;
    purpose?: string;
    transferLegalBasis?: string;
    safeguards?: string;
    notes?: string;
  }[];
  retention: {
    activeRetentionPeriod: string;
    retentionCriteria: string;
    legalOrContractualBasis: string;
    blockingApplies: boolean;
    anonymizationApplies: boolean;
    deletionApplies: boolean;
    deletionMethod: string;
    reviewFrequency: string;
    responsibleRole: string;
    notes: string;
  };
  securityMeasures: {
    securityMeasureId: string;
    implemented: boolean;
    evidence?: string;
    criticality?: string;
    notes?: string;
  }[];
  lifecycle: {
    lifecyclePhaseId: string;
    activityDescription?: string;
    processedDataDescription?: string;
    participants?: string;
    mediumOrSupport?: string;
    technologies?: string;
    linkedDocuments?: string;
    securityMeasuresByPhase?: string;
    risksByPhase?: string;
  }[];
  riskAssessment: {
    usesSpecialCategories: boolean;
    involvesChildren: boolean;
    largeScale: boolean;
    systematicMonitoring: boolean;
    profiling: boolean;
    automatedDecisions: boolean;
    videoSurveillance: boolean;
    geolocation: boolean;
    biometricData: boolean;
    healthData: boolean;
    criminalData: boolean;
    crossBorderTransfer: boolean;
    potentialHighImpact: boolean;
  };
  treatmentResponsibleUserId: string;
  dpoId: string;
  dpoName: string;
  dpoContactEmail: string;
  dpoContactPhone: string;
  jointControllerId: string;
  jointControllerName: string;
  jointControllerContact: string;
  automatedProcessing: boolean;
  profiling: boolean;
  profilingDescription: string;
  automatedDecisions: boolean;
  automatedDecisionsDescription: string;
  automatedDecisionsLogic: string;
  automatedDecisionsConsequences: string;
  humanInterventionAvailable: boolean;
  usesAi: boolean;
  aiSystemDescription: string;
  largeScaleProcessing: boolean;
  internationalTransfer: boolean;
}

const emptyForm: WizardForm = {
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
  treatmentResponsibleUserId: '',
  dpoId: '',
  dpoName: '',
  dpoContactEmail: '',
  dpoContactPhone: '',
  jointControllerId: '',
  jointControllerName: '',
  jointControllerContact: '',
  automatedProcessing: false,
  profiling: false,
  profilingDescription: '',
  automatedDecisions: false,
  automatedDecisionsDescription: '',
  automatedDecisionsLogic: '',
  automatedDecisionsConsequences: '',
  humanInterventionAvailable: false,
  usesAi: false,
  aiSystemDescription: '',
  largeScaleProcessing: false,
  internationalTransfer: false,
};

function getAdvancedRegulatoryErrors(form: WizardForm): string[] {
  const errors: string[] = [];

  if (form.profiling && !form.profilingDescription.trim()) {
    errors.push('Debe describir la finalidad y consecuencias del perfilamiento');
  }

  if (form.automatedDecisions) {
    if (!form.automatedDecisionsDescription.trim()) {
      errors.push('Debe describir las decisiones automatizadas');
    }
    if (!form.automatedDecisionsLogic.trim()) {
      errors.push('Debe documentar la lógica o criterios de las decisiones automatizadas');
    }
    if (!form.automatedDecisionsConsequences.trim()) {
      errors.push('Debe documentar las consecuencias de las decisiones automatizadas para el titular');
    }
    if (!form.humanInterventionAvailable) {
      errors.push('Debe registrar la disponibilidad de intervención humana en decisiones automatizadas');
    }
  }

  if (form.usesAi && !form.aiSystemDescription.trim()) {
    errors.push('Debe describir el sistema de IA y sus medidas de mitigación');
  }

  return errors;
}

function validateStep(step: number, form: WizardForm): string[] {
  const errors: string[] = [];
  switch (step) {
    case 1:
      if (!form.companyId) errors.push('Debe seleccionar una empresa');
      if (!form.areaId) errors.push('Debe seleccionar un área');
      if (!form.processId) errors.push('Debe seleccionar un proceso');
      if (!form.code.trim()) errors.push('El código RAT es obligatorio');
      if (!form.name.trim()) errors.push('El nombre del tratamiento es obligatorio');
      break;
    case 2:
      if (!form.mainPurpose.trim()) errors.push('La finalidad principal es obligatoria');
      break;
    case 3:
      if (form.dataSubjects.length === 0) errors.push('Debe agregar al menos un titular');
      else {
        form.dataSubjects.forEach((s, i) => {
          if (!s.dataSubjectTypeId) errors.push(`Titular #${i + 1}: tipo es obligatorio`);
        });
      }
      break;
    case 4:
      if (form.dataItems.length === 0) errors.push('Debe agregar al menos un dato personal');
      else {
        form.dataItems.forEach((item, i) => {
          if (!item.dataItemId) errors.push(`Dato #${i + 1}: selección es obligatoria`);
        });
      }
      break;
    case 5:
      if (form.legalBases.length === 0) errors.push('Debe agregar al menos una base legal');
      else {
        form.legalBases.forEach((b, i) => {
          if (!b.legalBasisId) errors.push(`Base legal #${i + 1}: selección es obligatoria`);
        });
      }
      break;
    case 6:
      errors.push(...getAdvancedRegulatoryErrors(form));
      break;
    case 7:
      if (form.hasThirdParties) {
        if (form.thirdParties.length === 0) errors.push('Debe agregar al menos un tercero');
        else {
          form.thirdParties.forEach((item, i) => {
            if (!item.thirdPartyId) errors.push(`Tercero #${i + 1}: selección es obligatoria`);
            if (!item.accessPurpose?.trim()) errors.push(`Tercero #${i + 1}: finalidad del acceso es obligatoria`);
            if (!item.accessedDataDescription?.trim()) errors.push(`Tercero #${i + 1}: datos accedidos son obligatorios`);
          });
        }
      }
      break;
    case 8:
      if (form.hasInternationalTransfers) {
        if (form.internationalTransfers.length === 0) errors.push('Debe agregar al menos una transferencia internacional');
        else {
          form.internationalTransfers.forEach((item, i) => {
            if (!item.countryId) errors.push(`Transferencia #${i + 1}: país destino es obligatorio`);
            if (!item.thirdPartyId?.trim() && !item.destinationName?.trim()) {
              errors.push(`Transferencia #${i + 1}: debe identificar destinatario o proveedor`);
            }
            if (!item.transferredDataDescription?.trim()) errors.push(`Transferencia #${i + 1}: datos transferidos son obligatorios`);
            if (!item.purpose?.trim()) errors.push(`Transferencia #${i + 1}: finalidad es obligatoria`);
            if (!item.safeguards?.trim()) errors.push(`Transferencia #${i + 1}: salvaguardas son obligatorias`);
          });
        }
      }
      break;
    case 9:
      if (!form.retention.activeRetentionPeriod.trim()) errors.push('El período de retención es obligatorio');
      break;
    case 11:
      if (form.lifecycle.length === 0) {
        errors.push('Debe agregar al menos una fase del ciclo de vida');
      } else {
        form.lifecycle.forEach((item, i) => {
          if (!item.lifecyclePhaseId) errors.push(`Fase #${i + 1}: selección es obligatoria`);
          if (!item.activityDescription?.trim()) errors.push(`Fase #${i + 1}: actividad es obligatoria`);
        });
      }
      break;
    case 12:
      // Paso de riesgo: no hay campos obligatorios, son flags
      break;
    case 13:
      if (!form.companyId || !form.areaId || !form.processId || !form.code.trim() || !form.name.trim()) {
        errors.push('Faltan campos obligatorios de identificación');
      }
      if (!form.mainPurpose.trim()) errors.push('Falta la finalidad principal');
      if (form.dataSubjects.length === 0) errors.push('Debe agregar al menos un titular');
      if (form.dataItems.length === 0) errors.push('Debe agregar al menos un dato personal');
      if (form.legalBases.length === 0) errors.push('Debe agregar al menos una base legal');
      if (form.hasThirdParties && form.thirdParties.length === 0) errors.push('Debe agregar terceros o destinatarios');
      if (form.hasInternationalTransfers && form.internationalTransfers.length === 0) errors.push('Debe agregar transferencias internacionales');
      if (!form.retention.activeRetentionPeriod.trim()) errors.push('Debe completar conservación');
      if (form.securityMeasures.length === 0) errors.push('Debe agregar al menos una medida de seguridad');
      errors.push(...getAdvancedRegulatoryErrors(form));
      break;
  }
  return errors;
}

function mapTreatmentToForm(treatment: Treatment): WizardForm {
  return {
    companyId: treatment.companyId,
    areaId: treatment.areaId,
    processId: treatment.processId,
    code: treatment.code,
    name: treatment.name,
    shortDescription: treatment.shortDescription || '',
    mainPurpose: treatment.mainPurpose,
    secondaryPurposes: treatment.secondaryPurposes || '',
    originOfData: treatment.originOfData || '',
    dataCollectionChannel: treatment.dataCollectionChannel || '',
    approximateVolume: treatment.approximateVolume || '',
    processingFrequency: treatment.processingFrequency || '',
    dataSubjects: treatment.dataSubjects || [],
    dataItems: treatment.treatmentDataItems || [],
    legalBases: treatment.treatmentLegalBases || [],
    captureSystem: treatment.captureSystem || '',
    storageSystem: treatment.storageSystem || '',
    medium: treatment.medium || '',
    technologies: treatment.technologies || '',
    linkedDocuments: treatment.linkedDocuments || '',
    applications: treatment.applications || '',
    hasThirdParties: (treatment.treatmentThirdParties?.length || 0) > 0,
    thirdParties: treatment.treatmentThirdParties || [],
    hasInternationalTransfers: (treatment.internationalTransfers?.length || 0) > 0,
    internationalTransfers: treatment.internationalTransfers || [],
    retention: treatment.treatmentRetention || {
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
    securityMeasures: treatment.treatmentSecurityMeasures || [],
    lifecycle: [...(treatment.lifecyclePhases || [])].sort((a, b) => a.phaseOrder - b.phaseOrder),
    riskAssessment: treatment.riskAssessment || {
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
    treatmentResponsibleUserId: treatment.treatmentResponsibleUserId || '',
    dpoId: treatment.dpoId || '',
    dpoName: treatment.dpoName || '',
    dpoContactEmail: treatment.dpoContactEmail || '',
    dpoContactPhone: treatment.dpoContactPhone || '',
    jointControllerId: treatment.jointControllerId || '',
    jointControllerName: treatment.jointControllerName || '',
    jointControllerContact: treatment.jointControllerContact || '',
    automatedProcessing: treatment.automatedProcessing,
    profiling: treatment.profiling,
    profilingDescription: treatment.profilingDescription || '',
    automatedDecisions: treatment.automatedDecisions,
    automatedDecisionsDescription: treatment.automatedDecisionsDescription || '',
    automatedDecisionsLogic: treatment.automatedDecisionsLogic || '',
    automatedDecisionsConsequences: treatment.automatedDecisionsConsequences || '',
    humanInterventionAvailable: treatment.humanInterventionAvailable,
    usesAi: treatment.usesAi,
    aiSystemDescription: treatment.aiSystemDescription || '',
    largeScaleProcessing: treatment.largeScaleProcessing,
    internationalTransfer: treatment.internationalTransfer,
  };
}

export function TreatmentWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { currentStep, totalSteps, nextStep, prevStep, isFirstStep, isLastStep } = useWizard();
  const [form, setForm] = useState<WizardForm>(emptyForm);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const { data: treatment, isLoading: isLoadingTreatment } = useQuery({
    queryKey: ['treatment', id],
    queryFn: () => treatmentService.getOne(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (treatment) {
      setForm(mapTreatmentToForm(treatment));
    }
  }, [treatment]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => (isEditMode ? treatmentService.update(id!, payload) : treatmentService.create(payload)),
    onSuccess: async (data) => {
      if (isLastStep) {
        const nextStatus = isEditMode && treatment?.currentStatus === 'en_correccion' ? 'subsanado' : 'enviado';
        await treatmentService.changeStatus(data.id, nextStatus);
        navigate('/treatments');
      } else {
        navigate('/treatments');
      }
    },
    onError: (err: any) => {
      setStepErrors([err?.response?.data?.message || 'Error al guardar el tratamiento. Intente nuevamente.']);
    },
  });

  const handleSaveDraft = () => {
    setStepErrors([]);
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
      captureSystem: form.captureSystem,
      storageSystem: form.storageSystem,
      medium: form.medium,
      technologies: form.technologies,
      linkedDocuments: form.linkedDocuments,
      applications: form.applications,
      treatmentResponsibleUserId: form.treatmentResponsibleUserId || undefined,
      dpoId: form.dpoId || undefined,
      dpoName: form.dpoName || undefined,
      dpoContactEmail: form.dpoContactEmail || undefined,
      dpoContactPhone: form.dpoContactPhone || undefined,
      jointControllerId: form.jointControllerId || undefined,
      jointControllerName: form.jointControllerName || undefined,
      jointControllerContact: form.jointControllerContact || undefined,
      automatedProcessing: form.automatedProcessing,
      profiling: form.profiling,
      profilingDescription: form.profilingDescription || undefined,
      automatedDecisions: form.automatedDecisions,
      automatedDecisionsDescription: form.automatedDecisionsDescription || undefined,
      automatedDecisionsLogic: form.automatedDecisionsLogic || undefined,
      automatedDecisionsConsequences: form.automatedDecisionsConsequences || undefined,
      humanInterventionAvailable: form.humanInterventionAvailable,
      usesAi: form.usesAi,
      aiSystemDescription: form.aiSystemDescription || undefined,
      largeScaleProcessing: form.largeScaleProcessing,
      internationalTransfer: form.internationalTransfer || form.hasInternationalTransfers,
      dataSubjects: form.dataSubjects,
      dataItems: form.dataItems,
      legalBases: form.legalBases,
      retention: form.retention,
      securityMeasures: form.securityMeasures,
      thirdParties: form.hasThirdParties ? form.thirdParties : [],
      internationalTransfers: form.hasInternationalTransfers ? form.internationalTransfers : [],
      lifecycle: form.lifecycle,
      riskAssessment: form.riskAssessment,
    };
    saveMutation.mutate(payload as any);
  };

  const handleNext = () => {
    const errors = validateStep(currentStep, form);
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    if (isLastStep) {
      handleSaveDraft();
    } else {
      nextStep();
    }
  };

  const updateForm = (values: Partial<WizardForm>) => {
    setForm((prev) => ({ ...prev, ...values }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identification values={form} onChange={updateForm} errors={stepErrors} />;
      case 2:
        return <Step2Purpose values={form} onChange={updateForm} errors={stepErrors} />;
      case 3:
        return <Step3DataSubjects values={form} onChange={updateForm} errors={stepErrors} />;
      case 4:
        return <Step4DataItems values={form} onChange={updateForm} errors={stepErrors} />;
      case 5:
        return <Step5LegalBasis values={form} onChange={updateForm} errors={stepErrors} />;
      case 6:
        return <Step6Technologies values={form} onChange={updateForm} errors={stepErrors} />;
      case 7:
        return <Step7ThirdParties values={form} onChange={updateForm} errors={stepErrors} />;
      case 8:
        return <Step8Transfers values={form} onChange={updateForm} errors={stepErrors} />;
      case 9:
        return <Step9Retention values={form} onChange={updateForm} errors={stepErrors} />;
      case 10:
        return <Step10Security values={form} onChange={updateForm} errors={stepErrors} />;
      case 11:
        return <Step11Lifecycle values={form} onChange={updateForm} errors={stepErrors} />;
      case 12:
        return <Step12Risk values={form} onChange={updateForm} errors={stepErrors} />;
      case 13:
        return <Step13Summary values={form} errors={stepErrors} />;
      default:
        return null;
    }
  };

  if (isEditMode && isLoadingTreatment) {
    return <div className="p-4 text-sm text-gray-500">Cargando tratamiento...</div>;
  }

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
        errors={stepErrors}
        isSaving={saveMutation.isPending}
        apiError={null}
      >
        {renderStep()}
      </WizardLayout>
    </div>
  );
}
