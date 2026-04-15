import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import { KpiResponseDto } from './dto/kpi-response.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getTreatmentInclude() {
    return {
      company: true,
      area: true,
      process: true,
      dataSubjects: { include: { dataSubjectType: true } },
      treatmentDataItems: { include: { dataItem: { include: { dataCategory: true } } } },
      treatmentLegalBases: { include: { legalBasis: true } },
      treatmentThirdParties: { include: { thirdParty: { include: { thirdPartyType: true } } } },
      internationalTransfers: { include: { country: true } },
      treatmentRetention: { include: { retentionRule: true } },
      treatmentSecurityMeasures: { include: { securityMeasure: true } },
      lifecyclePhases: { include: { lifecyclePhase: true }, orderBy: { phaseOrder: 'asc' } },
      riskAssessment: true,
      observations: true,
      statusHistory: { orderBy: { changedAt: 'asc' } },
      versions: { orderBy: { versionNumber: 'asc' } },
    } as const;
  }

  async generateRatMasterExcel(companyId: string) {
    const treatments = await this.prisma.treatment.findMany({
      where: { companyId },
      include: this.getTreatmentInclude(),
      orderBy: { code: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RAT Servientrega';
    workbook.created = new Date();

    // Hoja 1: Resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.addRow(['REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)']);
    summarySheet.addRow(['Empresa', treatments[0]?.company?.legalName || '']);
    summarySheet.addRow(['Total de tratamientos', treatments.length]);
    summarySheet.addRow(['Aprobados', treatments.filter(t => t.currentStatus === 'aprobado').length]);
    summarySheet.addRow(['En revisión', treatments.filter(t => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length]);
    summarySheet.addRow(['Alto riesgo', treatments.filter(t => t.highRiskFlag).length]);
    summarySheet.addRow(['Requieren EIPD', treatments.filter(t => t.requiresDpia).length]);
    summarySheet.addRow([]);

    // Hoja 2: Tratamientos
    const treatmentsSheet = workbook.addWorksheet('Tratamientos');
    treatmentsSheet.addRow([
      'Código', 'Nombre', 'Versión', 'Área', 'Proceso', 'Estado', 'Nivel de riesgo',
      'Alto riesgo', 'Requiere EIPD', 'Finalidad principal', 'Finalidades secundarias',
      'Origen de datos', 'Canal de recolección', 'Volumen aproximado', 'Frecuencia',
      'Procesamiento automatizado', 'Perfilamiento', 'Decisiones automatizadas', 'Usa IA',
      'Gran escala', 'Transferencia internacional', 'Fecha de envío', 'Fecha de aprobación',
    ]);
    treatments.forEach(t => {
      treatmentsSheet.addRow([
        t.code, t.name, t.version, t.area?.name, t.process?.name, t.currentStatus, t.riskLevel,
        t.highRiskFlag ? 'Sí' : 'No', t.requiresDpia ? 'Sí' : 'No', t.mainPurpose, t.secondaryPurposes,
        t.originOfData, t.dataCollectionChannel, t.approximateVolume, t.processingFrequency,
        t.automatedProcessing ? 'Sí' : 'No', t.profiling ? 'Sí' : 'No', t.automatedDecisions ? 'Sí' : 'No', t.usesAi ? 'Sí' : 'No',
        t.largeScaleProcessing ? 'Sí' : 'No', t.internationalTransfer ? 'Sí' : 'No',
        t.submissionDate ? t.submissionDate.toISOString() : '',
        t.approvalDate ? t.approvalDate.toISOString() : '',
      ]);
    });

    // Hoja 3: Titulares de datos
    const subjectsSheet = workbook.addWorksheet('Titulares');
    subjectsSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Tipo de titular', 'Cantidad aproximada', 'Origen', 'Relación']);
    treatments.forEach(t => {
      t.dataSubjects.forEach(ds => {
        subjectsSheet.addRow([t.code, t.name, ds.dataSubjectType?.name, ds.approximateCount, ds.sourceType, ds.relationshipWithCompany]);
      });
    });

    // Hoja 4: Datos tratados
    const dataSheet = workbook.addWorksheet('Datos tratados');
    dataSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Categoría', 'Dato', 'Requerido', 'Opcional', 'Origen']);
    treatments.forEach(t => {
      t.treatmentDataItems.forEach(item => {
        dataSheet.addRow([
          t.code, t.name, item.dataItem?.dataCategory?.name, item.dataItem?.name,
          item.isRequired ? 'Sí' : 'No', item.isOptional ? 'Sí' : 'No', item.sourceDirectOrIndirect,
        ]);
      });
    });

    // Hoja 5: Bases legales
    const legalSheet = workbook.addWorksheet('Bases legales');
    legalSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Base legal', 'Justificación', 'Principal', 'Validada por DPO']);
    treatments.forEach(t => {
      t.treatmentLegalBases.forEach(lb => {
        legalSheet.addRow([
          t.code, t.name, lb.legalBasis?.name, lb.justification,
          lb.isMainBasis ? 'Sí' : 'No', lb.validatedByDpo ? 'Sí' : 'No',
        ]);
      });
    });

    // Hoja 6: Terceros
    const thirdPartiesSheet = workbook.addWorksheet('Terceros');
    thirdPartiesSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Tercero', 'Tipo', 'Propósito de acceso', 'Transferencia fuera del país']);
    treatments.forEach(t => {
      t.treatmentThirdParties.forEach(tp => {
        thirdPartiesSheet.addRow([
          t.code, t.name, tp.thirdParty?.name, tp.thirdParty?.thirdPartyType?.name,
          tp.accessPurpose, tp.transferOutsideCountry ? 'Sí' : 'No',
        ]);
      });
    });

    // Hoja 7: Transferencias internacionales
    const transfersSheet = workbook.addWorksheet('Transferencias internacionales');
    transfersSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'País', 'Destinatario', 'Datos transferidos', 'Propósito', 'Salvaguardas', 'Aprobado DPO']);
    treatments.forEach(t => {
      t.internationalTransfers.forEach(it => {
        transfersSheet.addRow([
          t.code, t.name, it.country?.name, it.destinationName, it.transferredDataDescription,
          it.purpose, it.safeguards, it.approvedByDpo ? 'Sí' : 'No',
        ]);
      });
    });

    // Hoja 8: Retención
    const retentionSheet = workbook.addWorksheet('Retención');
    retentionSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Regla de retención', 'Período activo', 'Criterios', 'Base legal', 'Bloqueo', 'Anonimización', 'Eliminación']);
    treatments.forEach(t => {
      const r = t.treatmentRetention;
      if (r) {
        retentionSheet.addRow([
          t.code, t.name, r.retentionRule?.name, r.activeRetentionPeriod, r.retentionCriteria, r.legalOrContractualBasis,
          r.blockingApplies ? 'Sí' : 'No', r.anonymizationApplies ? 'Sí' : 'No', r.deletionApplies ? 'Sí' : 'No',
        ]);
      }
    });

    // Hoja 9: Medidas de seguridad
    const securitySheet = workbook.addWorksheet('Medidas de seguridad');
    securitySheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Medida', 'Implementada', 'Evidencia', 'Criticalidad']);
    treatments.forEach(t => {
      t.treatmentSecurityMeasures.forEach(sm => {
        securitySheet.addRow([
          t.code, t.name, sm.securityMeasure?.name, sm.implemented ? 'Sí' : 'No', sm.evidence, sm.criticality,
        ]);
      });
    });

    // Hoja 10: Ciclo de vida
    const lifecycleSheet = workbook.addWorksheet('Ciclo de vida');
    lifecycleSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Fase', 'Orden', 'Descripción actividad', 'Datos procesados', 'Participantes', 'Tecnologías']);
    treatments.forEach(t => {
      t.lifecyclePhases.forEach(lp => {
        lifecycleSheet.addRow([
          t.code, t.name, lp.lifecyclePhase?.name, lp.phaseOrder, lp.activityDescription,
          lp.processedDataDescription, lp.participants, lp.technologies,
        ]);
      });
    });

    // Hoja 11: Evaluación de riesgo
    const riskSheet = workbook.addWorksheet('Evaluación de riesgo');
    riskSheet.addRow([
      'Código tratamiento', 'Nombre tratamiento', 'Datos especiales', 'Menores', 'Gran escala',
      'Monitoreo sistemático', 'Perfilamiento', 'Decisiones automatizadas', 'Videovigilancia',
      'Geolocalización', 'Biometría', 'Salud', 'Judiciales', 'Transferencia transfronteriza',
      'Alto impacto potencial', 'Alto riesgo', 'Requiere EIPD',
    ]);
    treatments.forEach(t => {
      const r = t.riskAssessment;
      if (r) {
        riskSheet.addRow([
          t.code, t.name, r.usesSpecialCategories ? 'Sí' : 'No', r.involvesChildren ? 'Sí' : 'No',
          r.largeScale ? 'Sí' : 'No', r.systematicMonitoring ? 'Sí' : 'No', r.profiling ? 'Sí' : 'No',
          r.automatedDecisions ? 'Sí' : 'No', r.videoSurveillance ? 'Sí' : 'No', r.geolocation ? 'Sí' : 'No',
          r.biometricData ? 'Sí' : 'No', r.healthData ? 'Sí' : 'No', r.criminalData ? 'Sí' : 'No',
          r.crossBorderTransfer ? 'Sí' : 'No', r.potentialHighImpact ? 'Sí' : 'No',
          r.highRiskFlag ? 'Sí' : 'No', r.requiresDpia ? 'Sí' : 'No',
        ]);
      }
    });

    // Hoja 12: Observaciones
    const observationsSheet = workbook.addWorksheet('Observaciones DPO');
    observationsSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Sección', 'Mensaje', 'Estado', 'Fecha']);
    treatments.forEach(t => {
      t.observations.forEach(o => {
        observationsSheet.addRow([t.code, t.name, o.sectionCode, o.message, o.status, o.createdAt.toISOString()]);
      });
    });

    // Hoja 13: Historial de estados
    const historySheet = workbook.addWorksheet('Historial de estados');
    historySheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Estado anterior', 'Nuevo estado', 'Comentario', 'Fecha']);
    treatments.forEach(t => {
      t.statusHistory.forEach(h => {
        historySheet.addRow([t.code, t.name, h.previousStatus, h.newStatus, h.comment, h.changedAt.toISOString()]);
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateRatMasterPdf(companyId: string) {
    const treatments = await this.prisma.treatment.findMany({
      where: { companyId },
      include: this.getTreatmentInclude(),
      orderBy: { code: 'asc' },
    });

    const companyName = treatments[0]?.company?.legalName || 'Empresa';

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RAT Maestro</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; color: #333; }
        h1 { font-size: 18px; color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
        h2 { font-size: 14px; color: #374151; margin-top: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
        h3 { font-size: 12px; color: #4b5563; margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; font-weight: 600; }
        .section { page-break-inside: avoid; margin-bottom: 20px; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-gray { background: #f3f4f6; color: #374151; }
        .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
        .summary-box p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <h1>Registro de Actividades de Tratamiento (RAT)</h1>
      <div class="summary-box">
        <p><strong>Empresa:</strong> ${companyName}</p>
        <p><strong>Total de tratamientos:</strong> ${treatments.length}</p>
        <p><strong>Aprobados:</strong> ${treatments.filter(t => t.currentStatus === 'aprobado').length}</p>
        <p><strong>En revisión:</strong> ${treatments.filter(t => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length}</p>
        <p><strong>Alto riesgo:</strong> ${treatments.filter(t => t.highRiskFlag).length}</p>
        <p><strong>Requieren EIPD:</strong> ${treatments.filter(t => t.requiresDpia).length}</p>
      </div>
    `;

    for (const t of treatments) {
      const riskBadge = t.highRiskFlag
        ? '<span class="badge badge-red">ALTO RIESGO</span>'
        : t.requiresDpia
        ? '<span class="badge badge-yellow">REQUIERE EIPD</span>'
        : '<span class="badge badge-green">Riesgo bajo/medio</span>';

      html += `
      <div class="section">
        <h2>${t.code} - ${t.name} <span style="font-size:10px;font-weight:normal;">(v${t.version})</span> ${riskBadge}</h2>
        
        <table>
          <tr><th>Área</th><td>${t.area?.name || ''}</td><th>Proceso</th><td>${t.process?.name || ''}</td></tr>
          <tr><th>Estado</th><td>${t.currentStatus}</td><th>Nivel de riesgo</th><td>${t.riskLevel || 'N/A'}</td></tr>
          <tr><th>Finalidad principal</th><td colspan="3">${t.mainPurpose || ''}</td></tr>
          <tr><th>Finalidades secundarias</th><td colspan="3">${t.secondaryPurposes || ''}</td></tr>
          <tr><th>Origen de datos</th><td>${t.originOfData || ''}</td><th>Canal</th><td>${t.dataCollectionChannel || ''}</td></tr>
          <tr><th>Volumen</th><td>${t.approximateVolume || ''}</td><th>Frecuencia</th><td>${t.processingFrequency || ''}</td></tr>
          <tr><th>Automatizado</th><td>${t.automatedProcessing ? 'Sí' : 'No'}</td><th>IA</th><td>${t.usesAi ? 'Sí' : 'No'}</td></tr>
          <tr><th>Perfilamiento</th><td>${t.profiling ? 'Sí' : 'No'}</td><th>Decisiones auto.</th><td>${t.automatedDecisions ? 'Sí' : 'No'}</td></tr>
        </table>
      `;

      if (t.dataSubjects.length) {
        html += `<h3>Titulares de datos</h3><table><tr><th>Tipo</th><th>Cantidad</th><th>Origen</th><th>Relación</th></tr>`;
        t.dataSubjects.forEach(ds => {
          html += `<tr><td>${ds.dataSubjectType?.name || ''}</td><td>${ds.approximateCount || ''}</td><td>${ds.sourceType || ''}</td><td>${ds.relationshipWithCompany || ''}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.treatmentDataItems.length) {
        html += `<h3>Datos tratados</h3><table><tr><th>Categoría</th><th>Dato</th><th>Req.</th><th>Opt.</th></tr>`;
        t.treatmentDataItems.forEach(item => {
          html += `<tr><td>${item.dataItem?.dataCategory?.name || ''}</td><td>${item.dataItem?.name || ''}</td><td>${item.isRequired ? 'Sí' : 'No'}</td><td>${item.isOptional ? 'Sí' : 'No'}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.treatmentLegalBases.length) {
        html += `<h3>Bases legales</h3><table><tr><th>Base legal</th><th>Justificación</th><th>Principal</th><th>Validada</th></tr>`;
        t.treatmentLegalBases.forEach(lb => {
          html += `<tr><td>${lb.legalBasis?.name || ''}</td><td>${lb.justification || ''}</td><td>${lb.isMainBasis ? 'Sí' : 'No'}</td><td>${lb.validatedByDpo ? 'Sí' : 'No'}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.treatmentThirdParties.length) {
        html += `<h3>Terceros</h3><table><tr><th>Tercero</th><th>Tipo</th><th>Propósito</th><th>Transferencia</th></tr>`;
        t.treatmentThirdParties.forEach(tp => {
          html += `<tr><td>${tp.thirdParty?.name || ''}</td><td>${tp.thirdParty?.thirdPartyType?.name || ''}</td><td>${tp.accessPurpose || ''}</td><td>${tp.transferOutsideCountry ? 'Sí' : 'No'}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.internationalTransfers.length) {
        html += `<h3>Transferencias internacionales</h3><table><tr><th>País</th><th>Destinatario</th><th>Datos</th><th>Propósito</th><th>Aprobado DPO</th></tr>`;
        t.internationalTransfers.forEach(it => {
          html += `<tr><td>${it.country?.name || ''}</td><td>${it.destinationName || ''}</td><td>${it.transferredDataDescription || ''}</td><td>${it.purpose || ''}</td><td>${it.approvedByDpo ? 'Sí' : 'No'}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.treatmentRetention) {
        const r = t.treatmentRetention;
        html += `<h3>Retención</h3><table><tr><th>Regla</th><td>${r.retentionRule?.name || ''}</td><th>Período</th><td>${r.activeRetentionPeriod || ''}</td></tr><tr><th>Criterios</th><td>${r.retentionCriteria || ''}</td><th>Base legal</th><td>${r.legalOrContractualBasis || ''}</td></tr><tr><th>Bloqueo</th><td>${r.blockingApplies ? 'Sí' : 'No'}</td><th>Eliminación</th><td>${r.deletionApplies ? 'Sí' : 'No'}</td></tr></table>`;
      }

      if (t.treatmentSecurityMeasures.length) {
        html += `<h3>Medidas de seguridad</h3><table><tr><th>Medida</th><th>Implementada</th><th>Criticalidad</th></tr>`;
        t.treatmentSecurityMeasures.forEach(sm => {
          html += `<tr><td>${sm.securityMeasure?.name || ''}</td><td>${sm.implemented ? 'Sí' : 'No'}</td><td>${sm.criticality || ''}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.lifecyclePhases.length) {
        html += `<h3>Ciclo de vida</h3><table><tr><th>Fase</th><th>Orden</th><th>Actividad</th><th>Datos</th><th>Participantes</th></tr>`;
        t.lifecyclePhases.forEach(lp => {
          html += `<tr><td>${lp.lifecyclePhase?.name || ''}</td><td>${lp.phaseOrder}</td><td>${lp.activityDescription || ''}</td><td>${lp.processedDataDescription || ''}</td><td>${lp.participants || ''}</td></tr>`;
        });
        html += `</table>`;
      }

      if (t.riskAssessment) {
        const r = t.riskAssessment;
        html += `<h3>Evaluación de riesgo</h3><table><tr>`;
        const riskRows = [
          ['Datos especiales', r.usesSpecialCategories], ['Menores', r.involvesChildren], ['Gran escala', r.largeScale],
          ['Monitoreo', r.systematicMonitoring], ['Perfilamiento', r.profiling], ['Decisiones auto.', r.automatedDecisions],
          ['Videovigilancia', r.videoSurveillance], ['Geolocalización', r.geolocation], ['Biometría', r.biometricData],
          ['Salud', r.healthData], ['Judiciales', r.criminalData], ['Transfronterizo', r.crossBorderTransfer], ['Alto impacto', r.potentialHighImpact],
        ];
        riskRows.forEach(([label, val]) => {
          html += `<th>${label}</th><td>${val ? 'Sí' : 'No'}</td>`;
        });
        html += `</tr></table>`;
      }

      if (t.observations.length) {
        html += `<h3>Observaciones DPO</h3><table><tr><th>Sección</th><th>Mensaje</th><th>Estado</th></tr>`;
        t.observations.forEach(o => {
          html += `<tr><td>${o.sectionCode}</td><td>${o.message}</td><td>${o.status}</td></tr>`;
        });
        html += `</table>`;
      }

      html += `</div>`;
    }

    html += `</body></html>`;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } });
    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  async getKpis(companyId: string): Promise<KpiResponseDto> {
    const treatments = await this.prisma.treatment.findMany({
      where: { companyId },
      include: { area: true, observations: true, riskAssessment: true },
    });

    const totalTreatments = treatments.length;
    const pendingStatuses = ['borrador', 'en_edicion', 'enviado', 'observado', 'en_correccion', 'subsanado'];
    const pendingTreatments = treatments.filter(t => pendingStatuses.includes(t.currentStatus)).length;
    const approvedTreatments = treatments.filter(t => t.currentStatus === 'aprobado').length;
    const rejectedOrArchived = treatments.filter(t => ['rechazado', 'archivado'].includes(t.currentStatus)).length;
    const highRiskTreatments = treatments.filter(t => t.highRiskFlag).length;
    const requiresDpia = treatments.filter(t => t.requiresDpia).length;
    const dpiaCompleted = treatments.filter(t => t.requiresDpia && t.dpiaStatus === 'completado').length;
    const dpiaPending = treatments.filter(t => t.requiresDpia && t.dpiaStatus !== 'completado').length;
    const underDpoReview = treatments.filter(t => ['enviado', 'en_revision_dpo', 'subsanado'].includes(t.currentStatus)).length;
    const withOpenObservations = treatments.filter(t => t.observations.some(o => o.status === 'abierta')).length;

    const statusBreakdown: Record<string, number> = {};
    treatments.forEach(t => {
      statusBreakdown[t.currentStatus] = (statusBreakdown[t.currentStatus] || 0) + 1;
    });

    const riskLevelBreakdown: Record<string, number> = {};
    treatments.forEach(t => {
      const level = t.riskLevel || 'sin_evaluar';
      riskLevelBreakdown[level] = (riskLevelBreakdown[level] || 0) + 1;
    });

    const areaCounts: Record<string, { areaId: string; areaName: string; count: number }> = {};
    treatments.forEach(t => {
      const key = t.areaId;
      if (!areaCounts[key]) {
        areaCounts[key] = { areaId: t.areaId, areaName: t.area?.name || 'Sin área', count: 0 };
      }
      areaCounts[key].count += 1;
    });
    const topAreas = Object.values(areaCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });

    const recentActivity = last30Days.map(date => ({
      date,
      count: treatments.filter(t => t.createdAt.toISOString().slice(0, 10) === date).length,
    }));

    return {
      totalTreatments,
      pendingTreatments,
      approvedTreatments,
      rejectedOrArchived,
      highRiskTreatments,
      requiresDpia,
      dpiaCompleted,
      dpiaPending,
      underDpoReview,
      withOpenObservations,
      statusBreakdown,
      riskLevelBreakdown,
      topAreas,
      recentActivity,
    };
  }
}
