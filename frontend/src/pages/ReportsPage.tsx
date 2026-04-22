import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { reportsService } from '../services/reports.service';
import { useAuthStore } from '../store/authStore';
import { canDownloadRatMaster } from '../utils/roleAccess';
import { toastSuccess, toastError } from '../components/ui/Toast';

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const canDownload = canDownloadRatMaster(user?.roleCode);

  const handleExcel = async () => {
    setLoadingExcel(true);
    try {
      const blob = await reportsService.downloadRatMasterExcel(user?.companyId);
      downloadBlob(blob, `RAT_Maestro_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toastSuccess('Excel descargado correctamente');
    } catch (e) {
      toastError('Error al descargar el Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  const handlePdf = async () => {
    setLoadingPdf(true);
    try {
      const blob = await reportsService.downloadRatMasterPdf(user?.companyId);
      downloadBlob(blob, `RAT_Maestro_${new Date().toISOString().slice(0, 10)}.pdf`);
      toastSuccess('PDF descargado correctamente');
    } catch (e) {
      toastError('Error al descargar el PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  const reportCards = [
    {
      title: 'RAT Maestro Excel',
      description: 'Exporta el RAT completo en formato Excel con múltiples hojas de análisis.',
      icon: FileSpreadsheet,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700 shadow-green-600/20',
      loading: loadingExcel,
      disabled: !canDownload || loadingExcel,
      onClick: handleExcel,
      format: 'Excel (.xlsx)',
    },
    {
      title: 'RAT Maestro PDF',
      description: 'Exporta el RAT completo en formato PDF para compartir o archivar.',
      icon: FileText,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
      loading: loadingPdf,
      disabled: !canDownload || loadingPdf,
      onClick: handlePdf,
      format: 'PDF (.pdf)',
    },
  ];

  const contents = [
    'Resumen ejecutivo',
    'Listado de tratamientos',
    'Titulares de datos',
    'Datos tratados por categoría',
    'Bases legales aplicadas',
    'Terceros y encargados',
    'Transferencias internacionales',
    'Políticas de retención',
    'Medidas de seguridad',
    'Ciclo de vida del tratamiento',
    'Evaluación de riesgo y EIPD',
    'Observaciones del DPO',
    'Historial de estados',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500">Genera y descarga reportes del sistema</p>
      </div>

      {!canDownload && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Tu rol no tiene permiso para descargar el RAT maestro. Contacta al administrador.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon size={24} className={card.iconColor} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                  <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {card.format}
                  </span>
                </div>
              </div>
              <button
                onClick={card.onClick}
                disabled={card.disabled}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:shadow-none ${card.buttonBg}`}
              >
                {card.loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Descargar
                  </>
                )}
              </button>
            </div>
          );
        })}

        {/* Info card */}
        <div className="rounded-xl bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">Contenido incluido</h3>
          </div>
          <ul className="grid gap-2 text-sm text-gray-600 sm:grid-cols-1">
            {contents.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
