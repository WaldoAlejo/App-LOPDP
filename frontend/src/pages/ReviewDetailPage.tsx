import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentService } from '../services/treatment.service';
import { reviewService } from '../services/review.service';
import { aiService } from '../services/ai.service';
import { clsx } from 'clsx';
import { useAuthStore } from '../store/authStore';
import { Sparkles, CheckCircle, XCircle, AlertTriangle, Shield, Users, Database, Globe, Lock, FileText, Cpu, Clock } from 'lucide-react';

const sections = [
  { code: 'identificacion', label: 'Identificación', icon: FileText },
  { code: 'finalidad', label: 'Finalidad', icon: FileText },
  { code: 'titulares', label: 'Titulares de datos', icon: Users },
  { code: 'datos', label: 'Datos personales', icon: Database },
  { code: 'base_legal', label: 'Base legal', icon: Shield },
  { code: 'tecnologias', label: 'Tecnologías', icon: Cpu },
  { code: 'terceros', label: 'Terceros', icon: Users },
  { code: 'transferencias', label: 'Transferencias', icon: Globe },
  { code: 'conservacion', label: 'Conservación', icon: Clock },
  { code: 'seguridad', label: 'Seguridad', icon: Lock },
  { code: 'ciclo_vida', label: 'Ciclo de vida', icon: Clock },
  { code: 'riesgo', label: 'Evaluación de riesgo', icon: AlertTriangle },
];

type ConfirmAction = 'approve' | 'observe' | 'return' | 'requestDpia' | null;

const actionLabels: Record<Exclude<ConfirmAction, null>, { title: string; message: string; color: string }> = {
  approve: { title: 'Aprobar tratamiento', message: '¿Está seguro de aprobar este tratamiento? Esta acción lo marcará como aprobado y finalizará el flujo de revisión.', color: 'bg-green-600 hover:bg-green-700' },
  observe: { title: 'Observar tratamiento', message: '¿Está seguro de observar este tratamiento? El solicitante deberá corregir las observaciones antes de continuar.', color: 'bg-yellow-500 hover:bg-yellow-600' },
  return: { title: 'Devolver tratamiento', message: '¿Está seguro de devolver este tratamiento? Será enviado a corrección.', color: 'bg-orange-500 hover:bg-orange-600' },
  requestDpia: { title: 'Requerir EIPD', message: '¿Está seguro de requerir un EIPD? Este tratamiento deberá completar una evaluación de impacto en protección de datos antes de ser aprobado.', color: 'bg-red-600 hover:bg-red-700' },
};

// Componente para mostrar un campo con su etiqueta
function Field({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={clsx('rounded-md p-3', highlight ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50')}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">No registrado</span>}</dd>
    </div>
  );
}

// Componente para mostrar una tabla de datos
function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows || rows.length === 0) return <p className="text-sm text-gray-400 italic">No hay registros</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-sm text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente de sugerencia IA
function AiSuggestion({ field, value, treatment }: { field: string; value: string; treatment?: any }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const res = await aiService.suggest({ 
        field, 
        currentValue: value,
        treatmentName: treatment?.name,
        mainPurpose: treatment?.mainPurpose,
        context: { section: field }
      });
      setSuggestion(res.suggestion || 'No hay sugerencias para este campo.');
    } catch {
      setSuggestion('No se pudo obtener sugerencia en este momento.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-2">
      {!suggestion ? (
        <button
          onClick={getSuggestion}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100"
        >
          <Sparkles size={12} />
          {loading ? 'Analizando...' : 'Sugerencia de IA'}
        </button>
      ) : (
        <div className="rounded-md bg-purple-50 border border-purple-100 p-2">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="mt-0.5 text-purple-600 shrink-0" />
            <p className="text-xs text-purple-800">{suggestion}</p>
          </div>
          <button onClick={() => setSuggestion('')} className="mt-1 text-xs text-purple-600 hover:underline">Ocultar</button>
        </div>
      )}
    </div>
  );
}

export function ReviewDetailPage() {
  const user = useAuthStore((s) => s.user);
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('identificacion');
  const [newObservation, setNewObservation] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [comment, setComment] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: treatment, isLoading: treatmentLoading } = useQuery({
    queryKey: ['treatment', id],
    queryFn: () => treatmentService.getOne(id!),
    enabled: !!id,
  });

  const { data: observations } = useQuery({
    queryKey: ['observations', id],
    queryFn: () => reviewService.getObservations(id!),
    enabled: !!id,
  });

  const createObsMutation = useMutation({
    mutationFn: reviewService.createObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', id] });
      setNewObservation('');
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al crear la observación'),
  });

  const resolveObsMutation = useMutation({
    mutationFn: reviewService.resolveObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', id] });
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al resolver la observación'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ treatmentId, comment: cmt }: { treatmentId: string; comment?: string }) =>
      reviewService.approveTreatment(treatmentId, cmt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      setConfirmAction(null);
      setComment('');
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al aprobar el tratamiento'),
  });

  const observeMutation = useMutation({
    mutationFn: ({ treatmentId, comment: cmt }: { treatmentId: string; comment?: string }) =>
      reviewService.observeTreatment(treatmentId, cmt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      setConfirmAction(null);
      setComment('');
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al observar el tratamiento'),
  });

  const returnMutation = useMutation({
    mutationFn: ({ treatmentId, comment: cmt }: { treatmentId: string; comment?: string }) =>
      reviewService.returnTreatment(treatmentId, cmt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      setConfirmAction(null);
      setComment('');
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al devolver el tratamiento'),
  });

  const requestDpiaMutation = useMutation({
    mutationFn: ({ treatmentId, comment: cmt }: { treatmentId: string; comment?: string }) =>
      reviewService.requestDpia(treatmentId, cmt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      setConfirmAction(null);
      setComment('');
      setApiError(null);
    },
    onError: (err: any) => setApiError(err?.response?.data?.message || 'Error al requerir EIPD'),
  });

  if (treatmentLoading || !treatment) {
    return <div className="p-6 text-gray-500">Cargando tratamiento...</div>;
  }

  const sectionObservations = observations?.filter((o) => o.sectionCode === activeSection) || [];
  const openObservations = observations?.filter((o) => o.status === 'abierta') || [];
  const canExecuteReviewActions = ['SUPER_ADMIN', 'DPO'].includes(user?.roleCode || '');
  const canCreateObservations = canExecuteReviewActions;
  const canResolveObservations = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROCESS_LEADER', 'SUPPORT', 'AUDITOR', 'SECURITY_LEAD'].includes(user?.roleCode || '');
  const canApprove = canExecuteReviewActions && ['enviado', 'en_revision_dpo', 'subsanado', 'validado'].includes(treatment.currentStatus) && openObservations.length === 0;
  const canObserve = canExecuteReviewActions && ['enviado', 'en_revision_dpo', 'subsanado', 'validado'].includes(treatment.currentStatus) && openObservations.length > 0;
  const canReturn = canExecuteReviewActions && ['observado', 'subsanado'].includes(treatment.currentStatus) && openObservations.length > 0;
  const canRequestDpia = canExecuteReviewActions && ['enviado', 'en_revision_dpo', 'subsanado', 'validado'].includes(treatment.currentStatus);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const payload = { treatmentId: treatment.id, comment: comment.trim() || undefined };
    switch (confirmAction) {
      case 'approve': approveMutation.mutate(payload); break;
      case 'observe': observeMutation.mutate(payload); break;
      case 'return': returnMutation.mutate(payload); break;
      case 'requestDpia': requestDpiaMutation.mutate(payload); break;
    }
  };

  const isMutating = approveMutation.isPending || observeMutation.isPending || returnMutation.isPending || requestDpiaMutation.isPending;

  // Renderizar contenido de cada sección
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'identificacion':
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Código RAT" value={treatment.code} highlight />
              <Field label="Nombre" value={treatment.name} highlight />
              <Field label="Versión" value={treatment.version} />
              <Field label="Estado actual" value={treatment.currentStatus} />
              <Field label="Empresa" value={treatment.company?.legalName} />
              <Field label="Área" value={treatment.area?.name} />
              <Field label="Proceso" value={treatment.process?.name} />
              <Field label="Responsable operativo" value={treatment.treatmentResponsibleUserId ? 'Asignado' : 'No asignado'} />
            </div>
            <Field label="Descripción breve" value={treatment.shortDescription} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="DPO" value={treatment.dpoName} />
              <Field label="Email DPO" value={treatment.dpoContactEmail} />
              <Field label="Teléfono DPO" value={treatment.dpoContactPhone} />
            </div>
            {treatment.jointControllerName && (
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                <p className="text-xs font-medium text-orange-700 uppercase">Corresponsable</p>
                <p className="text-sm text-orange-900"><strong>{treatment.jointControllerName}</strong></p>
                <p className="text-xs text-orange-700">{treatment.jointControllerContact}</p>
              </div>
            )}
            <AiSuggestion field="identificacion" value={treatment.name} treatment={treatment} />
          </div>
        );

      case 'finalidad':
        return (
          <div className="space-y-4">
            <Field label="Finalidad principal" value={treatment.mainPurpose} highlight />
            <AiSuggestion field="finalidad_principal" value={treatment.mainPurpose} treatment={treatment} />
            <Field label="Finalidades secundarias" value={treatment.secondaryPurposes} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Origen de los datos" value={treatment.originOfData} />
              <Field label="Canal de recolección" value={treatment.dataCollectionChannel} />
              <Field label="Volumen aproximado" value={treatment.approximateVolume} />
              <Field label="Frecuencia" value={treatment.processingFrequency} />
            </div>
          </div>
        );

      case 'titulares':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Tipo de titular', 'Cantidad', 'Origen', 'Relación']}
              rows={treatment.dataSubjects?.map((ds: any) => [
                ds.dataSubjectType?.name || 'No especificado',
                ds.approximateCount || '-',
                ds.sourceType || '-',
                ds.relationshipWithCompany || '-',
              ]) || []}
            />
            <AiSuggestion field="titulares" value={treatment.dataSubjects?.map((d: any) => d.dataSubjectType?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'datos':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Dato', 'Categoría', 'Requerido', 'Opcional', 'Origen']}
              rows={treatment.treatmentDataItems?.map((item: any) => [
                item.dataItem?.name || 'No especificado',
                item.dataItem?.dataCategory?.name || '-',
                item.isRequired ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-gray-300" />,
                item.isOptional ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-gray-300" />,
                item.sourceDirectOrIndirect || '-',
              ]) || []}
            />
            <AiSuggestion field="datos_personales" value={treatment.treatmentDataItems?.map((d: any) => d.dataItem?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'base_legal':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Base legal', 'Justificación', 'Principal', 'Validada DPO']}
              rows={treatment.treatmentLegalBases?.map((lb: any) => [
                lb.legalBasis?.name || 'No especificado',
                lb.justification || '-',
                lb.isMainBasis ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium">Sí</span> : <span className="text-gray-400">-</span>,
                lb.validatedByDpo ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium">Sí</span> : <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 font-medium">Pendiente</span>,
              ]) || []}
            />
            <AiSuggestion field="base_legal" value={treatment.treatmentLegalBases?.map((b: any) => b.legalBasis?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'tecnologias':
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Sistema de captura" value={treatment.captureSystem} />
              <Field label="Sistema de almacenamiento" value={treatment.storageSystem} />
              <Field label="Soporte" value={treatment.medium} />
              <Field label="Tecnologías" value={treatment.technologies} />
            </div>
            <Field label="Documentos vinculados" value={treatment.linkedDocuments} />
            <Field label="Aplicativos" value={treatment.applications} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="¿Procesamiento automatizado?" value={treatment.automatedProcessing ? 'Sí' : 'No'} />
              <Field label="¿Perfilamiento?" value={treatment.profiling ? 'Sí' : 'No'} />
              <Field label="¿Decisiones automatizadas?" value={treatment.automatedDecisions ? 'Sí' : 'No'} />
              <Field label="¿Usa IA?" value={treatment.usesAi ? 'Sí' : 'No'} />
            </div>
            {treatment.profiling && <Field label="Descripción del perfilamiento" value={treatment.profilingDescription} />}
            {treatment.automatedDecisions && (
              <>
                <Field label="Descripción de decisiones automatizadas" value={treatment.automatedDecisionsDescription} />
                <Field label="Lógica del sistema" value={treatment.automatedDecisionsLogic} />
                <Field label="Consecuencias para el titular" value={treatment.automatedDecisionsConsequences} />
                <Field label="¿Intervención humana disponible?" value={treatment.humanInterventionAvailable ? 'Sí' : 'No'} />
              </>
            )}
            {treatment.usesAi && <Field label="Descripción del sistema IA" value={treatment.aiSystemDescription} />}
            <AiSuggestion field="tecnologias" value={treatment.technologies || ''} treatment={treatment} />
          </div>
        );

      case 'terceros':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Tercero', 'Tipo', 'Finalidad del acceso', 'Datos accedidos', 'Transferencia fuera del país']}
              rows={treatment.treatmentThirdParties?.map((tp: any) => [
                tp.thirdParty?.name || 'No especificado',
                tp.thirdParty?.thirdPartyType?.name || '-',
                tp.accessPurpose || '-',
                tp.accessedDataDescription || '-',
                tp.transferOutsideCountry ? <AlertTriangle size={14} className="text-orange-500" /> : <CheckCircle size={14} className="text-green-500" />,
              ]) || []}
            />
            <AiSuggestion field="terceros" value={treatment.treatmentThirdParties?.map((t: any) => t.thirdParty?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'transferencias':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['País', 'Destinatario', 'Datos transferidos', 'Finalidad', 'Salvaguardas', 'Aprobado DPO']}
              rows={treatment.internationalTransfers?.map((it: any) => [
                it.country?.name || 'No especificado',
                it.destinationName || '-',
                it.transferredDataDescription || '-',
                it.purpose || '-',
                it.safeguards || '-',
                it.approvedByDpo ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />,
              ]) || []}
            />
            <AiSuggestion field="transferencias" value={treatment.internationalTransfers?.map((t: any) => t.country?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'conservacion':
        return (
          <div className="space-y-4">
            {treatment.treatmentRetention ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Regla de retención" value={treatment.treatmentRetention.retentionRule?.name} />
                <Field label="Período activo" value={treatment.treatmentRetention.activeRetentionPeriod} />
                <Field label="Criterios" value={treatment.treatmentRetention.retentionCriteria} />
                <Field label="Base legal" value={treatment.treatmentRetention.legalOrContractualBasis} />
                <Field label="¿Aplica bloqueo?" value={treatment.treatmentRetention.blockingApplies ? 'Sí' : 'No'} />
                <Field label="¿Aplica anonimización?" value={treatment.treatmentRetention.anonymizationApplies ? 'Sí' : 'No'} />
                <Field label="¿Aplica eliminación?" value={treatment.treatmentRetention.deletionApplies ? 'Sí' : 'No'} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No hay información de conservación registrada.</p>
            )}
            <AiSuggestion field="conservacion" value={treatment.treatmentRetention?.activeRetentionPeriod || ''} treatment={treatment} />
          </div>
        );

      case 'seguridad':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Medida de seguridad', 'Implementada', 'Evidencia', 'Criticalidad']}
              rows={treatment.treatmentSecurityMeasures?.map((sm: any) => [
                sm.securityMeasure?.name || 'No especificado',
                sm.implemented ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />,
                sm.evidence || '-',
                sm.criticality || '-',
              ]) || []}
            />
            <AiSuggestion field="seguridad" value={treatment.treatmentSecurityMeasures?.map((s: any) => s.securityMeasure?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'ciclo_vida':
        return (
          <div className="space-y-4">
            <DataTable
              headers={['Fase', 'Actividad', 'Datos procesados', 'Participantes', 'Tecnologías']}
              rows={treatment.lifecyclePhases?.map((lp: any) => [
                lp.lifecyclePhase?.name || 'No especificado',
                lp.activityDescription || '-',
                lp.processedDataDescription || '-',
                lp.participants || '-',
                lp.technologies || '-',
              ]) || []}
            />
            <AiSuggestion field="ciclo_vida" value={treatment.lifecyclePhases?.map((l: any) => l.lifecyclePhase?.name).join(', ') || ''} treatment={treatment} />
          </div>
        );

      case 'riesgo':
        return (
          <div className="space-y-4">
            {treatment.riskAssessment ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Datos especiales', value: treatment.riskAssessment.usesSpecialCategories },
                    { label: 'Menores de edad', value: treatment.riskAssessment.involvesChildren },
                    { label: 'Gran escala', value: treatment.riskAssessment.largeScale },
                    { label: 'Monitoreo sistemático', value: treatment.riskAssessment.systematicMonitoring },
                    { label: 'Perfilamiento', value: treatment.riskAssessment.profiling },
                    { label: 'Decisiones automatizadas', value: treatment.riskAssessment.automatedDecisions },
                    { label: 'Videovigilancia', value: treatment.riskAssessment.videoSurveillance },
                    { label: 'Geolocalización', value: treatment.riskAssessment.geolocation },
                    { label: 'Datos biométricos', value: treatment.riskAssessment.biometricData },
                    { label: 'Datos de salud', value: treatment.riskAssessment.healthData },
                    { label: 'Datos judiciales', value: treatment.riskAssessment.criminalData },
                    { label: 'Transferencia transfronteriza', value: treatment.riskAssessment.crossBorderTransfer },
                    { label: 'Alto impacto potencial', value: treatment.riskAssessment.potentialHighImpact },
                  ].map((item) => (
                    <div key={item.label} className={clsx('rounded-md p-3 border', item.value ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                      <div className="flex items-center gap-2">
                        {item.value ? <AlertTriangle size={16} className="text-red-600" /> : <CheckCircle size={16} className="text-green-600" />}
                        <span className={clsx('text-sm font-medium', item.value ? 'text-red-800' : 'text-green-800')}>{item.label}</span>
                      </div>
                      <p className={clsx('mt-1 text-xs', item.value ? 'text-red-600' : 'text-green-600')}>
                        {item.value ? 'Sí aplica - Requiere atención' : 'No aplica'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="¿Alto riesgo?" value={treatment.highRiskFlag ? 'Sí ⚠️' : 'No ✅'} highlight={treatment.highRiskFlag} />
                  <Field label="¿Requiere EIPD?" value={treatment.requiresDpia ? 'Sí ⚠️' : 'No ✅'} highlight={treatment.requiresDpia} />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 italic">No hay evaluación de riesgo registrada.</p>
            )}
            <AiSuggestion field="riesgo" value={treatment.highRiskFlag ? 'Alto riesgo' : 'Riesgo normal'} treatment={treatment} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🔍 Revisión DPO - Tratamiento completo</h2>
          <p className="text-sm text-gray-500">{treatment.code} — {treatment.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setConfirmAction('approve')} disabled={!canApprove} className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Aprobar</button>
          <button onClick={() => setConfirmAction('observe')} disabled={!canObserve} className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50">Observar</button>
          <button onClick={() => setConfirmAction('return')} disabled={!canReturn} className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">Devolver</button>
          <button onClick={() => setConfirmAction('requestDpia')} disabled={!canRequestDpia} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">Requerir EIPD</button>
        </div>
      </div>

      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Error:</p><p>{apiError}</p>
        </div>
      )}

      {openObservations.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">⚠️ Este tratamiento tiene {openObservations.length} observación(es) abierta(s).</p>
          <p>No se puede aprobar hasta que se resuelvan todas las observaciones.</p>
        </div>
      )}

      {!canExecuteReviewActions && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Este tratamiento está en modo solo lectura para tu rol. Puedes revisar el contenido y las observaciones, pero no ejecutar acciones de revisión.
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white border p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{treatment.dataSubjects?.length || 0}</p>
          <p className="text-xs text-gray-500">Titulares</p>
        </div>
        <div className="rounded-lg bg-white border p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{treatment.treatmentDataItems?.length || 0}</p>
          <p className="text-xs text-gray-500">Datos personales</p>
        </div>
        <div className="rounded-lg bg-white border p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{treatment.treatmentThirdParties?.length || 0}</p>
          <p className="text-xs text-gray-500">Terceros</p>
        </div>
        <div className="rounded-lg bg-white border p-3 text-center">
          <p className="text-2xl font-bold text-primary-600">{treatment.internationalTransfers?.length || 0}</p>
          <p className="text-xs text-gray-500">Transferencias</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Tabs de secciones */}
        <div className="space-y-1 lg:col-span-1">
          {sections.map((section) => {
            const count = observations?.filter((o) => o.sectionCode === section.code && o.status === 'abierta').length || 0;
            const Icon = section.icon;
            return (
              <button
                key={section.code}
                onClick={() => setActiveSection(section.code)}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  activeSection === section.code
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon size={16} />
                <span className="flex-1">{section.label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido de la sección */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-lg bg-white p-5 shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const SectionIcon = sections.find(s => s.code === activeSection)?.icon || FileText;
                return <SectionIcon size={20} className="text-primary-600" />;
              })()}
              <h3 className="text-lg font-semibold text-gray-900">
                {sections.find((s) => s.code === activeSection)?.label}
              </h3>
            </div>
            {renderSectionContent()}
          </div>

          {/* Observaciones de la sección */}
          <div className="rounded-lg bg-white p-5 shadow-sm border">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">💬 Observaciones de esta sección</h4>

            {canCreateObservations && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  placeholder="Escriba una observación sobre esta sección..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={() => { if (newObservation.trim()) createObsMutation.mutate({ treatmentId: treatment.id, sectionCode: activeSection, message: newObservation.trim() }); }}
                  disabled={!newObservation.trim() || createObsMutation.isPending}
                  className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            )}

            <div className="space-y-2">
              {sectionObservations.length === 0 && (
                <p className="text-sm text-gray-500">No hay observaciones en esta sección.</p>
              )}
              {sectionObservations.map((obs) => (
                <div key={obs.id} className={clsx('rounded-md border p-3 text-sm', obs.status === 'abierta' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50')}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={obs.status === 'abierta' ? 'text-yellow-900' : 'text-green-900'}>{obs.message}</p>
                    {obs.status === 'abierta' && canResolveObservations && (
                      <button onClick={() => resolveObsMutation.mutate(obs.id)} className="whitespace-nowrap text-xs text-primary-600 hover:text-primary-700">Resolver</button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {obs.creatorRole} — {new Date(obs.createdAt).toLocaleString()}
                    {obs.status === 'cerrada' && ' — Resuelta'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">{actionLabels[confirmAction].title}</h3>
            <p className="mt-2 text-sm text-gray-600">{actionLabels[confirmAction].message}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Comentario (opcional)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Agregue un comentario sobre esta acción..." />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setConfirmAction(null); setComment(''); }} disabled={isMutating} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
              <button onClick={handleConfirm} disabled={isMutating} className={clsx('rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50', actionLabels[confirmAction].color)}>
                {isMutating ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
