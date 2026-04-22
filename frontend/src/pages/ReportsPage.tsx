import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import { reportsService } from '../services/reports.service';
import { useAuthStore } from '../store/authStore';
import { canDownloadRatMaster } from '../utils/roleAccess';

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
    } catch (e) {
      alert('Error al descargar el Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  const handlePdf = async () => {
    setLoadingPdf(true);
    try {
      const blob = await reportsService.downloadRatMasterPdf(user?.companyId);
      downloadBlob(blob, `RAT_Maestro_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      alert('Error al descargar el PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Reportes</h2>

      {!canDownload && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tu rol no tiene permiso para descargar el RAT maestro.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">RAT Maestro Excel</h3>
              <p className="text-sm text-gray-500">Exporta el RAT completo en formato Excel con múltiples hojas.</p>
            </div>
          </div>
          <button
            onClick={handleExcel}
            disabled={loadingExcel || !canDownload}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loadingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loadingExcel ? 'Generando...' : 'Descargar Excel'}
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">RAT Maestro PDF</h3>
              <p className="text-sm text-gray-500">Exporta el RAT completo en formato PDF para compartir.</p>
            </div>
          </div>
          <button
            onClick={handlePdf}
            disabled={loadingPdf || !canDownload}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loadingPdf ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Contenido del RAT Maestro</h3>
        <ul className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
          <li>• Resumen ejecutivo</li>
          <li>• Listado de tratamientos</li>
          <li>• Titulares de datos</li>
          <li>• Datos tratados por categoría</li>
          <li>• Bases legales aplicadas</li>
          <li>• Terceros y encargados</li>
          <li>• Transferencias internacionales</li>
          <li>• Políticas de retención</li>
          <li>• Medidas de seguridad</li>
          <li>• Ciclo de vida del tratamiento</li>
          <li>• Evaluación de riesgo y EIPD</li>
          <li>• Observaciones del DPO</li>
          <li>• Historial de estados</li>
        </ul>
      </div>
    </div>
  );
}
