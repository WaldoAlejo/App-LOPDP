import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { KpiResponseDto } from './dto/kpi-response.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private buildAccessibleTreatmentsWhere(currentUser: any, companyId?: string) {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      return companyId ? { companyId } : {};
    }

    if (['DPO', 'SECURITY_LEAD', 'AUDITOR'].includes(currentUser.roleCode)) {
      return { companyId: currentUser.companyId };
    }

    return {
      companyId: currentUser.companyId,
      OR: [
        { createdByUserId: currentUser.userId },
        { treatmentResponsibleUserId: currentUser.userId },
        { process: { responsibleUserId: currentUser.userId } },
      ],
    };
  }

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

  async generateRatMasterExcel(currentUser: any, companyId?: string) {
    const treatments = await this.prisma.treatment.findMany({
      where: this.buildAccessibleTreatmentsWhere(currentUser, companyId),
      include: this.getTreatmentInclude(),
      orderBy: { code: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RAT Servientrega';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.addRow(['REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)']);
    summarySheet.addRow(['Empresa', treatments[0]?.company?.legalName || '']);
    summarySheet.addRow(['Total de tratamientos', treatments.length]);
    summarySheet.addRow(['Aprobados', treatments.filter((t) => t.currentStatus === 'aprobado').length]);
    summarySheet.addRow(['En revisión', treatments.filter((t) => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length]);
    summarySheet.addRow(['Alto riesgo', treatments.filter((t) => t.highRiskFlag).length]);
    summarySheet.addRow(['Requieren EIPD', treatments.filter((t) => t.requiresDpia).length]);
    summarySheet.addRow([]);

    const treatmentsSheet = workbook.addWorksheet('Tratamientos');
    treatmentsSheet.addRow([
      'Código', 'Nombre', 'Versión', 'Área', 'Proceso', 'Estado', 'Nivel de riesgo',
      'Alto riesgo', 'Requiere EIPD', 'Finalidad principal', 'Finalidades secundarias',
      'Origen de datos', 'Canal de recolección', 'Volumen aproximado', 'Frecuencia',
      'Sistema de captura', 'Sistema de almacenamiento', 'Soporte', 'Tecnologías', 'Documentos vinculados', 'Aplicativos',
      'Procesamiento automatizado', 'Perfilamiento', 'Decisiones automatizadas', 'Usa IA',
      'Gran escala', 'Transferencia internacional', 'Fecha de envío', 'Fecha de aprobación',
    ]);
    treatments.forEach((t) => {
      treatmentsSheet.addRow([
        t.code, t.name, t.version, t.area?.name, t.process?.name, t.currentStatus, t.riskLevel,
        t.highRiskFlag ? 'Sí' : 'No', t.requiresDpia ? 'Sí' : 'No', t.mainPurpose, t.secondaryPurposes,
        t.originOfData, t.dataCollectionChannel, t.approximateVolume, t.processingFrequency,
        t.captureSystem, t.storageSystem, t.medium, t.technologies, t.linkedDocuments, t.applications,
        t.automatedProcessing ? 'Sí' : 'No', t.profiling ? 'Sí' : 'No', t.automatedDecisions ? 'Sí' : 'No', t.usesAi ? 'Sí' : 'No',
        t.largeScaleProcessing ? 'Sí' : 'No', t.internationalTransfer ? 'Sí' : 'No',
        t.submissionDate ? t.submissionDate.toISOString() : '',
        t.approvalDate ? t.approvalDate.toISOString() : '',
      ]);
    });

    const subjectsSheet = workbook.addWorksheet('Titulares');
    subjectsSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Tipo de titular', 'Cantidad aproximada', 'Origen', 'Relación']);
    treatments.forEach((t) => {
      t.dataSubjects.forEach((ds) => {
        subjectsSheet.addRow([t.code, t.name, ds.dataSubjectType?.name, ds.approximateCount, ds.sourceType, ds.relationshipWithCompany]);
      });
    });

    const dataSheet = workbook.addWorksheet('Datos tratados');
    dataSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Categoría', 'Dato', 'Requerido', 'Opcional', 'Origen']);
    treatments.forEach((t) => {
      t.treatmentDataItems.forEach((item) => {
        dataSheet.addRow([
          t.code, t.name, item.dataItem?.dataCategory?.name, item.dataItem?.name,
          item.isRequired ? 'Sí' : 'No', item.isOptional ? 'Sí' : 'No', item.sourceDirectOrIndirect,
        ]);
      });
    });

    const legalSheet = workbook.addWorksheet('Bases legales');
    legalSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Base legal', 'Justificación', 'Principal', 'Validada por DPO']);
    treatments.forEach((t) => {
      t.treatmentLegalBases.forEach((lb) => {
        legalSheet.addRow([
          t.code, t.name, lb.legalBasis?.name, lb.justification,
          lb.isMainBasis ? 'Sí' : 'No', lb.validatedByDpo ? 'Sí' : 'No',
        ]);
      });
    });

    const thirdPartiesSheet = workbook.addWorksheet('Terceros');
    thirdPartiesSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Tercero', 'Tipo', 'Propósito de acceso', 'Transferencia fuera del país']);
    treatments.forEach((t) => {
      t.treatmentThirdParties.forEach((tp) => {
        thirdPartiesSheet.addRow([
          t.code, t.name, tp.thirdParty?.name, tp.thirdParty?.thirdPartyType?.name,
          tp.accessPurpose, tp.transferOutsideCountry ? 'Sí' : 'No',
        ]);
      });
    });

    const transfersSheet = workbook.addWorksheet('Transferencias');
    transfersSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'País', 'Destinatario', 'Datos transferidos', 'Propósito', 'Salvaguardas', 'Aprobado DPO']);
    treatments.forEach((t) => {
      t.internationalTransfers.forEach((it) => {
        transfersSheet.addRow([
          t.code, t.name, it.country?.name, it.destinationName, it.transferredDataDescription,
          it.purpose, it.safeguards, it.approvedByDpo ? 'Sí' : 'No',
        ]);
      });
    });

    const retentionSheet = workbook.addWorksheet('Retención');
    retentionSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Regla de retención', 'Período activo', 'Criterios', 'Base legal', 'Bloqueo', 'Anonimización', 'Eliminación']);
    treatments.forEach((t) => {
      const retention = t.treatmentRetention;
      if (!retention) {
        return;
      }

      retentionSheet.addRow([
        t.code,
        t.name,
        retention.retentionRule?.name,
        retention.activeRetentionPeriod,
        retention.retentionCriteria,
        retention.legalOrContractualBasis,
        retention.blockingApplies ? 'Sí' : 'No',
        retention.anonymizationApplies ? 'Sí' : 'No',
        retention.deletionApplies ? 'Sí' : 'No',
      ]);
    });

    const securitySheet = workbook.addWorksheet('Medidas de seguridad');
    securitySheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Medida', 'Implementada', 'Evidencia', 'Criticalidad']);
    treatments.forEach((t) => {
      t.treatmentSecurityMeasures.forEach((sm) => {
        securitySheet.addRow([
          t.code, t.name, sm.securityMeasure?.name, sm.implemented ? 'Sí' : 'No', sm.evidence, sm.criticality,
        ]);
      });
    });

    const lifecycleSheet = workbook.addWorksheet('Ciclo de vida');
    lifecycleSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Fase', 'Orden', 'Descripción actividad', 'Datos procesados', 'Participantes', 'Tecnologías']);
    treatments.forEach((t) => {
      t.lifecyclePhases.forEach((lp) => {
        lifecycleSheet.addRow([
          t.code, t.name, lp.lifecyclePhase?.name, lp.phaseOrder, lp.activityDescription,
          lp.processedDataDescription, lp.participants, lp.technologies,
        ]);
      });
    });

    const riskSheet = workbook.addWorksheet('Evaluación de riesgo');
    riskSheet.addRow([
      'Código tratamiento', 'Nombre tratamiento', 'Datos especiales', 'Menores', 'Gran escala',
      'Monitoreo sistemático', 'Perfilamiento', 'Decisiones automatizadas', 'Videovigilancia',
      'Geolocalización', 'Biometría', 'Salud', 'Judiciales', 'Transferencia transfronteriza',
      'Alto impacto potencial', 'Alto riesgo', 'Requiere EIPD',
    ]);
    treatments.forEach((t) => {
      const risk = t.riskAssessment;
      if (!risk) {
        return;
      }

      riskSheet.addRow([
        t.code, t.name, risk.usesSpecialCategories ? 'Sí' : 'No', risk.involvesChildren ? 'Sí' : 'No',
        risk.largeScale ? 'Sí' : 'No', risk.systematicMonitoring ? 'Sí' : 'No', risk.profiling ? 'Sí' : 'No',
        risk.automatedDecisions ? 'Sí' : 'No', risk.videoSurveillance ? 'Sí' : 'No', risk.geolocation ? 'Sí' : 'No',
        risk.biometricData ? 'Sí' : 'No', risk.healthData ? 'Sí' : 'No', risk.criminalData ? 'Sí' : 'No',
        risk.crossBorderTransfer ? 'Sí' : 'No', risk.potentialHighImpact ? 'Sí' : 'No',
        t.highRiskFlag ? 'Sí' : 'No', t.requiresDpia ? 'Sí' : 'No',
      ]);
    });

    const observationsSheet = workbook.addWorksheet('Observaciones DPO');
    observationsSheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Sección', 'Mensaje', 'Estado', 'Fecha']);
    treatments.forEach((t) => {
      t.observations.forEach((o) => {
        observationsSheet.addRow([t.code, t.name, o.sectionCode, o.message, o.status, o.createdAt.toISOString()]);
      });
    });

    const historySheet = workbook.addWorksheet('Historial de estados');
    historySheet.addRow(['Código tratamiento', 'Nombre tratamiento', 'Estado anterior', 'Nuevo estado', 'Comentario', 'Fecha']);
    treatments.forEach((t) => {
      t.statusHistory.forEach((h) => {
        historySheet.addRow([t.code, t.name, h.previousStatus, h.newStatus, h.comment, h.changedAt.toISOString()]);
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateRatMasterPdf(currentUser: any, companyId?: string) {
    const treatments = await this.prisma.treatment.findMany({
      where: this.buildAccessibleTreatmentsWhere(currentUser, companyId),
      include: this.getTreatmentInclude(),
      orderBy: { code: 'asc' },
    });

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; }
          h1, h2, h3 { color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1>Registro de Actividades de Tratamiento (RAT)</h1>
        <p><strong>Empresa:</strong> ${treatments[0]?.company?.legalName || ''}</p>
        <p><strong>Total de tratamientos:</strong> ${treatments.length}</p>
        <p><strong>Aprobados:</strong> ${treatments.filter((t) => t.currentStatus === 'aprobado').length}</p>
        <p><strong>En revisión:</strong> ${treatments.filter((t) => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length}</p>
    `;

    treatments.forEach((t, index) => {
      html += `
        <div class="${index > 0 ? 'page-break' : ''}">
          <h2>${t.code} - ${t.name}</h2>
          <table>
            <tr><th>Área</th><td>${t.area?.name || ''}</td><th>Proceso</th><td>${t.process?.name || ''}</td></tr>
            <tr><th>Estado</th><td>${t.currentStatus}</td><th>Riesgo</th><td>${t.riskLevel || 'sin_evaluar'}</td></tr>
            <tr><th>Finalidad principal</th><td colspan="3">${t.mainPurpose || ''}</td></tr>
            <tr><th>Finalidades secundarias</th><td colspan="3">${t.secondaryPurposes || ''}</td></tr>
            <tr><th>Sistema de captura</th><td>${t.captureSystem || ''}</td><th>Sistema de almacenamiento</th><td>${t.storageSystem || ''}</td></tr>
            <tr><th>Tecnologías</th><td colspan="3">${t.technologies || ''}</td></tr>
          </table>
      `;

      if (t.treatmentLegalBases.length) {
        html += '<h3>Bases legales</h3><table><tr><th>Base legal</th><th>Justificación</th><th>Principal</th><th>Validada por DPO</th></tr>';
        t.treatmentLegalBases.forEach((lb) => {
          html += `<tr><td>${lb.legalBasis?.name || ''}</td><td>${lb.justification || ''}</td><td>${lb.isMainBasis ? 'Sí' : 'No'}</td><td>${lb.validatedByDpo ? 'Sí' : 'No'}</td></tr>`;
        });
        html += '</table>';
      }

      if (t.internationalTransfers.length) {
        html += '<h3>Transferencias internacionales</h3><table><tr><th>País</th><th>Destinatario</th><th>Datos</th><th>Propósito</th><th>Aprobado DPO</th></tr>';
        t.internationalTransfers.forEach((it) => {
          html += `<tr><td>${it.country?.name || ''}</td><td>${it.destinationName || ''}</td><td>${it.transferredDataDescription || ''}</td><td>${it.purpose || ''}</td><td>${it.approvedByDpo ? 'Sí' : 'No'}</td></tr>`;
        });
        html += '</table>';
      }

      if (t.treatmentSecurityMeasures.length) {
        html += '<h3>Medidas de seguridad</h3><table><tr><th>Medida</th><th>Implementada</th><th>Criticalidad</th></tr>';
        t.treatmentSecurityMeasures.forEach((sm) => {
          html += `<tr><td>${sm.securityMeasure?.name || ''}</td><td>${sm.implemented ? 'Sí' : 'No'}</td><td>${sm.criticality || ''}</td></tr>`;
        });
        html += '</table>';
      }

      if (t.observations.length) {
        html += '<h3>Observaciones DPO</h3><table><tr><th>Sección</th><th>Mensaje</th><th>Estado</th></tr>';
        t.observations.forEach((obs) => {
          html += `<tr><td>${obs.sectionCode || ''}</td><td>${obs.message || ''}</td><td>${obs.status || ''}</td></tr>`;
        });
        html += '</table>';
      }

      html += '</div>';
    });

    html += '</body></html>';

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16px', right: '16px', bottom: '16px', left: '16px' } });
    await browser.close();

    return Buffer.from(pdf);
  }

  async getKpis(currentUser: any, companyId?: string): Promise<KpiResponseDto> {
    const treatments = await this.prisma.treatment.findMany({
      where: this.buildAccessibleTreatmentsWhere(currentUser, companyId),
      include: { area: true, observations: true, riskAssessment: true },
    });

    const totalTreatments = treatments.length;
    const pendingStatuses = ['borrador', 'en_edicion', 'enviado', 'observado', 'en_correccion', 'subsanado'];
    const pendingTreatments = treatments.filter((t) => pendingStatuses.includes(t.currentStatus)).length;
    const approvedTreatments = treatments.filter((t) => t.currentStatus === 'aprobado').length;
    const rejectedOrArchived = treatments.filter((t) => ['rechazado', 'archivado'].includes(t.currentStatus)).length;
    const highRiskTreatments = treatments.filter((t) => t.highRiskFlag).length;
    const requiresDpia = treatments.filter((t) => t.requiresDpia).length;
    const dpiaCompleted = treatments.filter((t) => t.requiresDpia && t.dpiaStatus === 'completado').length;
    const dpiaPending = treatments.filter((t) => t.requiresDpia && t.dpiaStatus !== 'completado').length;
    const underDpoReview = treatments.filter((t) => ['enviado', 'en_revision_dpo', 'subsanado'].includes(t.currentStatus)).length;
    const withOpenObservations = treatments.filter((t) => t.observations.some((o) => o.status === 'abierta')).length;

    const statusBreakdown: Record<string, number> = {};
    treatments.forEach((t) => {
      statusBreakdown[t.currentStatus] = (statusBreakdown[t.currentStatus] || 0) + 1;
    });

    const riskLevelBreakdown: Record<string, number> = {};
    treatments.forEach((t) => {
      const level = t.riskLevel || 'sin_evaluar';
      riskLevelBreakdown[level] = (riskLevelBreakdown[level] || 0) + 1;
    });

    const areaCounts: Record<string, { areaId: string; areaName: string; count: number }> = {};
    treatments.forEach((t) => {
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
      const day = new Date();
      day.setDate(day.getDate() - (29 - i));
      return day.toISOString().slice(0, 10);
    });

    const recentActivity = last30Days.map((date) => ({
      date,
      count: treatments.filter((t) => t.createdAt.toISOString().slice(0, 10) === date).length,
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
