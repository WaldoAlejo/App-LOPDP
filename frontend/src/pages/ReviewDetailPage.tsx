import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentService } from '../services/treatment.service';
import { reviewService } from '../services/review.service';
import { clsx } from 'clsx';

const sections = [
  { code: 'identificacion', label: 'Identificación' },
  { code: 'finalidad', label: 'Finalidad' },
  { code: 'titulares', label: 'Titulares' },
  { code: 'datos', label: 'Datos personales' },
  { code: 'base_legal', label: 'Base legal' },
  { code: 'tecnologias', label: 'Tecnologías' },
  { code: 'terceros', label: 'Terceros' },
  { code: 'transferencias', label: 'Transferencias' },
  { code: 'conservacion', label: 'Conservación' },
  { code: 'seguridad', label: 'Seguridad' },
  { code: 'ciclo_vida', label: 'Ciclo de vida' },
  { code: 'riesgo', label: 'Riesgo' },
];

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('identificacion');
  const [newObservation, setNewObservation] = useState('');

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
    },
  });

  const resolveObsMutation = useMutation({
    mutationFn: reviewService.resolveObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', id] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ treatmentId, comment }: { treatmentId: string; comment?: string }) =>
      reviewService.approveTreatment(treatmentId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  const observeMutation = useMutation({
    mutationFn: ({ treatmentId, comment }: { treatmentId: string; comment?: string }) =>
      reviewService.observeTreatment(treatmentId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  const returnMutation = useMutation({
    mutationFn: ({ treatmentId, comment }: { treatmentId: string; comment?: string }) =>
      reviewService.returnTreatment(treatmentId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  const requestDpiaMutation = useMutation({
    mutationFn: ({ treatmentId, comment }: { treatmentId: string; comment?: string }) =>
      reviewService.requestDpia(treatmentId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  if (treatmentLoading || !treatment) {
    return <div className="p-6 text-gray-500">Cargando tratamiento...</div>;
  }

  const sectionObservations = observations?.filter((o) => o.sectionCode === activeSection) || [];
  const openObservations = observations?.filter((o) => o.status === 'abierta') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revisión DPO</h2>
          <p className="text-sm text-gray-500">{treatment.code} — {treatment.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => approveMutation.mutate({ treatmentId: treatment.id })}
            disabled={openObservations.length > 0}
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            onClick={() => observeMutation.mutate({ treatmentId: treatment.id })}
            className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600"
          >
            Observar
          </button>
          <button
            onClick={() => returnMutation.mutate({ treatmentId: treatment.id })}
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Devolver
          </button>
          <button
            onClick={() => requestDpiaMutation.mutate({ treatmentId: treatment.id })}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Requerir EIPD
          </button>
        </div>
      </div>

      {openObservations.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">Este tratamiento tiene {openObservations.length} observación(es) abierta(s).</p>
          <p>No se puede aprobar hasta que se resuelvan todas las observaciones.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tabs de secciones */}
        <div className="space-y-1 lg:col-span-1">
          {sections.map((section) => {
            const count = observations?.filter((o) => o.sectionCode === section.code && o.status === 'abierta').length || 0;
            return (
              <button
                key={section.code}
                onClick={() => setActiveSection(section.code)}
                className={clsx(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                  activeSection === section.code
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span>{section.label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido de la sección */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              {sections.find((s) => s.code === activeSection)?.label}
            </h3>

            {/* Vista simplificada del contenido según sección */}
            {activeSection === 'identificacion' && (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Nombre</dt><dd className="font-medium">{treatment.name}</dd></div>
                <div><dt className="text-gray-500">Código</dt><dd className="font-medium">{treatment.code}</dd></div>
                <div><dt className="text-gray-500">Versión</dt><dd className="font-medium">{treatment.version}</dd></div>
                <div><dt className="text-gray-500">Descripción</dt><dd className="font-medium">{treatment.shortDescription || '-'}</dd></div>
              </dl>
            )}
            {activeSection === 'finalidad' && (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Finalidad principal</dt><dd className="font-medium">{treatment.mainPurpose}</dd></div>
                <div><dt className="text-gray-500">Finalidades secundarias</dt><dd className="font-medium">{treatment.secondaryPurposes || '-'}</dd></div>
                <div><dt className="text-gray-500">Volumen aproximado</dt><dd className="font-medium">{treatment.approximateVolume || '-'}</dd></div>
              </dl>
            )}
            {activeSection === 'titulares' && (
              <p className="text-sm text-gray-500">{treatment.dataSubjects?.length || 0} tipo(s) de titular(es) registrado(s).</p>
            )}
            {activeSection === 'datos' && (
              <p className="text-sm text-gray-500">{treatment.treatmentDataItems?.length || 0} dato(s) registrado(s).</p>
            )}
            {activeSection === 'base_legal' && (
              <p className="text-sm text-gray-500">{treatment.treatmentLegalBases?.length || 0} base(s) legal(es) registrada(s).</p>
            )}
            {activeSection === 'riesgo' && (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Alto riesgo</dt><dd className="font-medium">{treatment.highRiskFlag ? 'Sí' : 'No'}</dd></div>
                <div><dt className="text-gray-500">Requiere EIPD</dt><dd className="font-medium">{treatment.requiresDpia ? 'Sí' : 'No'}</dd></div>
              </dl>
            )}
            {['tecnologias', 'terceros', 'transferencias', 'conservacion', 'seguridad', 'ciclo_vida'].includes(activeSection) && (
              <p className="text-sm text-gray-500">Información detallada disponible en la ficha completa.</p>
            )}
          </div>

          {/* Observaciones de la sección */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Observaciones de esta sección</h4>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                placeholder="Escriba una observación..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={() => {
                  if (newObservation.trim()) {
                    createObsMutation.mutate({ treatmentId: treatment.id, sectionCode: activeSection, message: newObservation.trim() });
                  }
                }}
                disabled={!newObservation.trim() || createObsMutation.isPending}
                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-2">
              {sectionObservations.length === 0 && (
                <p className="text-sm text-gray-500">No hay observaciones en esta sección.</p>
              )}
              {sectionObservations.map((obs) => (
                <div
                  key={obs.id}
                  className={clsx(
                    'rounded-md border p-3 text-sm',
                    obs.status === 'abierta'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={obs.status === 'abierta' ? 'text-yellow-900' : 'text-green-900'}>{obs.message}</p>
                    {obs.status === 'abierta' && (
                      <button
                        onClick={() => resolveObsMutation.mutate(obs.id)}
                        className="whitespace-nowrap text-xs text-primary-600 hover:text-primary-700"
                      >
                        Resolver
                      </button>
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
    </div>
  );
}
