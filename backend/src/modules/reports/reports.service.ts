import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';
import { KpiResponseDto } from './dto/kpi-response.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Colores corporativos Servientrega ───
  private readonly COLORS = {
    primary: 'C41E3A',        // Rojo Servientrega
    primaryLight: 'FDE8EC',   // Rojo claro para fondos
    secondary: '1B4D3E',      // Verde oscuro
    secondaryLight: 'E8F5E9', // Verde claro
    dark: '1F2937',           // Gris oscuro para texto
    gray: '6B7280',           // Gris medio
    lightGray: 'F3F4F6',      // Gris claro para fondos alternos
    white: 'FFFFFF',
    border: 'D1D5DB',         // Gris borde
    warning: 'F59E0B',        // Amarillo warning
    warningLight: 'FEF3C7',
    success: '10B981',        // Verde éxito
    successLight: 'D1FAE5',
    danger: 'EF4444',         // Rojo peligro
    dangerLight: 'FEE2E2',
  };

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

  // ─── Helpers de estilo ───
  private styleHeaderRow(worksheet: ExcelJS.Worksheet, columns: string[]) {
    const headerRow = worksheet.addRow(columns);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: this.COLORS.white }, size: 11, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.primary } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.border } },
        bottom: { style: 'thin', color: { argb: this.COLORS.border } },
        left: { style: 'thin', color: { argb: this.COLORS.border } },
        right: { style: 'thin', color: { argb: this.COLORS.border } },
      };
    });
    headerRow.height = 28;
  }

  private styleDataRow(row: ExcelJS.Row, isEven: boolean, status?: string) {
    row.eachCell((cell) => {
      cell.font = { size: 10, name: 'Calibri', color: { argb: this.COLORS.dark } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.border } },
        bottom: { style: 'thin', color: { argb: this.COLORS.border } },
        left: { style: 'thin', color: { argb: this.COLORS.border } },
        right: { style: 'thin', color: { argb: this.COLORS.border } },
      };
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.lightGray } };
      }
    });
    row.height = 22;

    // Color de estado
    if (status) {
      const statusCell = row.getCell(6); // Columna de estado
      const statusColors: Record<string, string> = {
        aprobado: this.COLORS.successLight,
        validado: this.COLORS.successLight,
        enviado: this.COLORS.warningLight,
        en_revision_dpo: this.COLORS.warningLight,
        observado: this.COLORS.dangerLight,
        en_correccion: this.COLORS.dangerLight,
        subsanado: this.COLORS.warningLight,
        rechazado: this.COLORS.dangerLight,
        archivado: this.COLORS.lightGray,
        borrador: this.COLORS.lightGray,
        en_edicion: this.COLORS.lightGray,
      };
      const statusFontColors: Record<string, string> = {
        aprobado: this.COLORS.success,
        validado: this.COLORS.success,
        enviado: this.COLORS.warning,
        en_revision_dpo: this.COLORS.warning,
        observado: this.COLORS.danger,
        en_correccion: this.COLORS.danger,
        subsanado: this.COLORS.warning,
        rechazado: this.COLORS.danger,
      };
      if (statusColors[status]) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[status] } };
      }
      if (statusFontColors[status]) {
        statusCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: statusFontColors[status] } };
      }
    }
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatDateTime(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private autoWidth(worksheet: ExcelJS.Worksheet, minWidth = 12, maxWidth = 50) {
    worksheet.columns.forEach((column) => {
      let maxLength = minWidth;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value?.toString() || '';
        maxLength = Math.max(maxLength, Math.min(cellValue.length + 2, maxWidth));
      });
      column.width = maxLength;
    });
  }

  private addSummaryCard(
    worksheet: ExcelJS.Worksheet,
    row: number,
    col: number,
    title: string,
    value: string | number,
    color: string,
  ) {
    const titleCell = worksheet.getCell(row, col);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 10, color: { argb: this.COLORS.gray }, name: 'Calibri' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const valueCell = worksheet.getCell(row + 1, col);
    valueCell.value = value;
    valueCell.font = { bold: true, size: 20, color: { argb: color }, name: 'Calibri' };
    valueCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Borde decorativo
    for (let c = col; c <= col; c++) {
      for (let r = row; r <= row + 1; r++) {
        const cell = worksheet.getCell(r, c);
        cell.border = {
          top: { style: 'medium', color: { argb: color } },
          bottom: { style: 'medium', color: { argb: color } },
          left: { style: 'medium', color: { argb: color } },
          right: { style: 'medium', color: { argb: color } },
        };
      }
    }
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
    workbook.modified = new Date();
    workbook.lastModifiedBy = 'RAT Servientrega';

    const companyName = treatments[0]?.company?.legalName || 'Servientrega';

    // ═══════════════════════════════════════════════════════════
    // HOJA 1: PORTADA / RESUMEN EJECUTIVO
    // ═══════════════════════════════════════════════════════════
    const summarySheet = workbook.addWorksheet('Resumen Ejecutivo');

    // Logo / Título principal
    summarySheet.mergeCells('A1:H1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)';
    titleCell.font = { bold: true, size: 20, color: { argb: this.COLORS.primary }, name: 'Calibri' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;

    summarySheet.mergeCells('A2:H2');
    const subtitleCell = summarySheet.getCell('A2');
    subtitleCell.value = `Empresa: ${companyName}`;
    subtitleCell.font = { size: 14, color: { argb: this.COLORS.dark }, name: 'Calibri' };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(2).height = 30;

    summarySheet.mergeCells('A3:H3');
    const dateCell = summarySheet.getCell('A3');
    dateCell.value = `Generado el: ${new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    dateCell.font = { italic: true, size: 10, color: { argb: this.COLORS.gray }, name: 'Calibri' };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(3).height = 25;

    // Espacio
    summarySheet.addRow([]);

    // KPIs en tarjetas
    const total = treatments.length;
    const aprobados = treatments.filter((t) => t.currentStatus === 'aprobado').length;
    const enRevision = treatments.filter((t) => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length;
    const altoRiesgo = treatments.filter((t) => t.highRiskFlag).length;
    const requierenEipd = treatments.filter((t) => t.requiresDpia).length;
    const pendientes = treatments.filter((t) => ['borrador', 'en_edicion'].includes(t.currentStatus)).length;
    const archivados = treatments.filter((t) => t.currentStatus === 'archivado').length;

    this.addSummaryCard(summarySheet, 5, 1, 'TOTAL TRATAMIENTOS', total, this.COLORS.primary);
    this.addSummaryCard(summarySheet, 5, 3, 'APROBADOS', aprobados, this.COLORS.success);
    this.addSummaryCard(summarySheet, 5, 5, 'EN REVISIÓN', enRevision, this.COLORS.warning);
    this.addSummaryCard(summarySheet, 5, 7, 'ALTO RIESGO', altoRiesgo, this.COLORS.danger);

    this.addSummaryCard(summarySheet, 8, 1, 'REQUIEREN EIPD', requierenEipd, this.COLORS.secondary);
    this.addSummaryCard(summarySheet, 8, 3, 'PENDIENTES', pendientes, this.COLORS.gray);
    this.addSummaryCard(summarySheet, 8, 5, 'ARCHIVADOS', archivados, this.COLORS.gray);
    this.addSummaryCard(summarySheet, 8, 7, 'DPO REVISANDO', treatments.filter((t) => ['enviado', 'en_revision_dpo', 'subsanado'].includes(t.currentStatus)).length, this.COLORS.warning);

    summarySheet.addRow([]);
    summarySheet.addRow([]);

    // Tabla de distribución por estado
    summarySheet.mergeCells('A11:H11');
    const distTitle = summarySheet.getCell('A11');
    distTitle.value = 'DISTRIBUCIÓN POR ESTADO';
    distTitle.font = { bold: true, size: 12, color: { argb: this.COLORS.primary }, name: 'Calibri' };
    distTitle.alignment = { horizontal: 'left', vertical: 'middle' };

    const statusLabels: Record<string, string> = {
      borrador: 'Borrador',
      en_edicion: 'En edición',
      enviado: 'Enviado',
      en_revision_dpo: 'En revisión DPO',
      observado: 'Observado',
      en_correccion: 'En corrección',
      subsanado: 'Subsanado',
      validado: 'Validado',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado',
      requiere_eipd: 'Requiere EIPD',
      archivado: 'Archivado',
    };

    const statusColors: Record<string, string> = {
      borrador: this.COLORS.lightGray,
      en_edicion: this.COLORS.lightGray,
      enviado: this.COLORS.warningLight,
      en_revision_dpo: this.COLORS.warningLight,
      observado: this.COLORS.dangerLight,
      en_correccion: this.COLORS.dangerLight,
      subsanado: this.COLORS.warningLight,
      validado: this.COLORS.successLight,
      aprobado: this.COLORS.successLight,
      rechazado: this.COLORS.dangerLight,
      requiere_eipd: this.COLORS.warningLight,
      archivado: this.COLORS.lightGray,
    };

    const statusHeader = summarySheet.addRow(['Estado', 'Cantidad', 'Porcentaje']);
    statusHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: this.COLORS.white }, size: 10, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.secondary } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.border } },
        bottom: { style: 'thin', color: { argb: this.COLORS.border } },
        left: { style: 'thin', color: { argb: this.COLORS.border } },
        right: { style: 'thin', color: { argb: this.COLORS.border } },
      };
    });

    Object.entries(statusLabels).forEach(([status, label]) => {
      const count = treatments.filter((t) => t.currentStatus === status).length;
      if (count > 0) {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
        const row = summarySheet.addRow([label, count, pct]);
        row.eachCell((cell, colNumber) => {
          cell.font = { size: 10, name: 'Calibri', color: { argb: this.COLORS.dark } };
          cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: this.COLORS.border } },
            bottom: { style: 'thin', color: { argb: this.COLORS.border } },
            left: { style: 'thin', color: { argb: this.COLORS.border } },
            right: { style: 'thin', color: { argb: this.COLORS.border } },
          };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[status] || this.COLORS.white } };
        });
      }
    });

    summarySheet.addRow([]);

    // Tabla de distribución por nivel de riesgo
    summarySheet.mergeCells('A16:H16');
    const riskTitle = summarySheet.getCell('A16');
    riskTitle.value = 'DISTRIBUCIÓN POR NIVEL DE RIESGO';
    riskTitle.font = { bold: true, size: 12, color: { argb: this.COLORS.primary }, name: 'Calibri' };
    riskTitle.alignment = { horizontal: 'left', vertical: 'middle' };

    const riskHeader = summarySheet.addRow(['Nivel de riesgo', 'Cantidad', 'Porcentaje']);
    riskHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: this.COLORS.white }, size: 10, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.secondary } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.border } },
        bottom: { style: 'thin', color: { argb: this.COLORS.border } },
        left: { style: 'thin', color: { argb: this.COLORS.border } },
        right: { style: 'thin', color: { argb: this.COLORS.border } },
      };
    });

    const riskLevels = ['bajo', 'medio', 'alto', 'sin_evaluar'];
    const riskLabels: Record<string, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', sin_evaluar: 'Sin evaluar' };
    const riskLevelColors: Record<string, string> = { bajo: this.COLORS.successLight, medio: this.COLORS.warningLight, alto: this.COLORS.dangerLight, sin_evaluar: this.COLORS.lightGray };

    riskLevels.forEach((level) => {
      const count = treatments.filter((t) => (t.riskLevel || 'sin_evaluar') === level).length;
      if (count > 0 || level === 'sin_evaluar') {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%';
        const row = summarySheet.addRow([riskLabels[level], count, pct]);
        row.eachCell((cell, colNumber) => {
          cell.font = { size: 10, name: 'Calibri', color: { argb: this.COLORS.dark } };
          cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: this.COLORS.border } },
            bottom: { style: 'thin', color: { argb: this.COLORS.border } },
            left: { style: 'thin', color: { argb: this.COLORS.border } },
            right: { style: 'thin', color: { argb: this.COLORS.border } },
          };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: riskLevelColors[level] } };
        });
      }
    });

    summarySheet.columns = [
      { width: 30 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
    ];

    // ═══════════════════════════════════════════════════════════
    // HOJA 2: TRATAMIENTOS
    // ═══════════════════════════════════════════════════════════
    const treatmentsSheet = workbook.addWorksheet('Tratamientos');
    treatmentsSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(treatmentsSheet, [
      'Código', 'Nombre', 'Versión', 'Área', 'Proceso', 'Estado', 'Nivel de riesgo',
      'Alto riesgo', 'Requiere EIPD', 'Finalidad principal', 'Finalidades secundarias',
      'Origen de datos', 'Canal de recolección', 'Volumen aproximado', 'Frecuencia',
      'Sistema de captura', 'Sistema de almacenamiento', 'Soporte', 'Tecnologías', 'Documentos vinculados', 'Aplicativos',
      'Procesamiento automatizado', 'Perfilamiento', 'Decisiones automatizadas', 'Usa IA',
      'Gran escala', 'Transferencia internacional', 'Fecha de envío', 'Fecha de aprobación',
    ]);

    treatments.forEach((t, idx) => {
      const row = treatmentsSheet.addRow([
        t.code, t.name, t.version, t.area?.name, t.process?.name, t.currentStatus, t.riskLevel,
        t.highRiskFlag ? 'Sí' : 'No', t.requiresDpia ? 'Sí' : 'No', t.mainPurpose, t.secondaryPurposes,
        t.originOfData, t.dataCollectionChannel, t.approximateVolume, t.processingFrequency,
        t.captureSystem, t.storageSystem, t.medium, t.technologies, t.linkedDocuments, t.applications,
        t.automatedProcessing ? 'Sí' : 'No', t.profiling ? 'Sí' : 'No', t.automatedDecisions ? 'Sí' : 'No', t.usesAi ? 'Sí' : 'No',
        t.largeScaleProcessing ? 'Sí' : 'No', t.internationalTransfer ? 'Sí' : 'No',
        this.formatDate(t.submissionDate),
        this.formatDate(t.approvalDate),
      ]);
      this.styleDataRow(row, idx % 2 === 0, t.currentStatus);
    });
    this.autoWidth(treatmentsSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 3: TITULARES
    // ═══════════════════════════════════════════════════════════
    const subjectsSheet = workbook.addWorksheet('Titulares');
    subjectsSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(subjectsSheet, ['Código tratamiento', 'Nombre tratamiento', 'Tipo de titular', 'Cantidad aproximada', 'Origen', 'Relación']);
    treatments.forEach((t) => {
      t.dataSubjects.forEach((ds, idx) => {
        const row = subjectsSheet.addRow([t.code, t.name, ds.dataSubjectType?.name, ds.approximateCount, ds.sourceType, ds.relationshipWithCompany]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(subjectsSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 4: DATOS TRATADOS
    // ═══════════════════════════════════════════════════════════
    const dataSheet = workbook.addWorksheet('Datos tratados');
    dataSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(dataSheet, ['Código tratamiento', 'Nombre tratamiento', 'Categoría', 'Dato', 'Requerido', 'Opcional', 'Origen']);
    treatments.forEach((t) => {
      t.treatmentDataItems.forEach((item, idx) => {
        const row = dataSheet.addRow([
          t.code, t.name, item.dataItem?.dataCategory?.name, item.dataItem?.name,
          item.isRequired ? 'Sí' : 'No', item.isOptional ? 'Sí' : 'No', item.sourceDirectOrIndirect,
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(dataSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 5: BASES LEGALES
    // ═══════════════════════════════════════════════════════════
    const legalSheet = workbook.addWorksheet('Bases legales');
    legalSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(legalSheet, ['Código tratamiento', 'Nombre tratamiento', 'Base legal', 'Justificación', 'Principal', 'Validada por DPO']);
    treatments.forEach((t) => {
      t.treatmentLegalBases.forEach((lb, idx) => {
        const row = legalSheet.addRow([
          t.code, t.name, lb.legalBasis?.name, lb.justification,
          lb.isMainBasis ? 'Sí' : 'No', lb.validatedByDpo ? 'Sí' : 'No',
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(legalSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 6: TERCEROS
    // ═══════════════════════════════════════════════════════════
    const thirdPartiesSheet = workbook.addWorksheet('Terceros');
    thirdPartiesSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(thirdPartiesSheet, ['Código tratamiento', 'Nombre tratamiento', 'Tercero', 'Tipo', 'Propósito de acceso', 'Transferencia fuera del país']);
    treatments.forEach((t) => {
      t.treatmentThirdParties.forEach((tp, idx) => {
        const row = thirdPartiesSheet.addRow([
          t.code, t.name, tp.thirdParty?.name, tp.thirdParty?.thirdPartyType?.name,
          tp.accessPurpose, tp.transferOutsideCountry ? 'Sí' : 'No',
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(thirdPartiesSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 7: TRANSFERENCIAS
    // ═══════════════════════════════════════════════════════════
    const transfersSheet = workbook.addWorksheet('Transferencias');
    transfersSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(transfersSheet, ['Código tratamiento', 'Nombre tratamiento', 'País', 'Destinatario', 'Datos transferidos', 'Propósito', 'Salvaguardas', 'Aprobado DPO']);
    treatments.forEach((t) => {
      t.internationalTransfers.forEach((it, idx) => {
        const row = transfersSheet.addRow([
          t.code, t.name, it.country?.name, it.destinationName, it.transferredDataDescription,
          it.purpose, it.safeguards, it.approvedByDpo ? 'Sí' : 'No',
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(transfersSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 8: RETENCIÓN
    // ═══════════════════════════════════════════════════════════
    const retentionSheet = workbook.addWorksheet('Retención');
    retentionSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(retentionSheet, ['Código tratamiento', 'Nombre tratamiento', 'Regla de retención', 'Período activo', 'Criterios', 'Base legal', 'Bloqueo', 'Anonimización', 'Eliminación']);
    treatments.forEach((t) => {
      const retention = t.treatmentRetention;
      if (!retention) return;
      const row = retentionSheet.addRow([
        t.code, t.name, retention.retentionRule?.name, retention.activeRetentionPeriod,
        retention.retentionCriteria, retention.legalOrContractualBasis,
        retention.blockingApplies ? 'Sí' : 'No', retention.anonymizationApplies ? 'Sí' : 'No', retention.deletionApplies ? 'Sí' : 'No',
      ]);
      this.styleDataRow(row, false);
    });
    this.autoWidth(retentionSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 9: MEDIDAS DE SEGURIDAD
    // ═══════════════════════════════════════════════════════════
    const securitySheet = workbook.addWorksheet('Medidas de seguridad');
    securitySheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(securitySheet, ['Código tratamiento', 'Nombre tratamiento', 'Medida', 'Implementada', 'Evidencia', 'Criticalidad']);
    treatments.forEach((t) => {
      t.treatmentSecurityMeasures.forEach((sm, idx) => {
        const row = securitySheet.addRow([
          t.code, t.name, sm.securityMeasure?.name, sm.implemented ? 'Sí' : 'No', sm.evidence, sm.criticality,
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(securitySheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 10: CICLO DE VIDA
    // ═══════════════════════════════════════════════════════════
    const lifecycleSheet = workbook.addWorksheet('Ciclo de vida');
    lifecycleSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(lifecycleSheet, ['Código tratamiento', 'Nombre tratamiento', 'Fase', 'Orden', 'Descripción actividad', 'Datos procesados', 'Participantes', 'Tecnologías']);
    treatments.forEach((t) => {
      t.lifecyclePhases.forEach((lp, idx) => {
        const row = lifecycleSheet.addRow([
          t.code, t.name, lp.lifecyclePhase?.name, lp.phaseOrder, lp.activityDescription,
          lp.processedDataDescription, lp.participants, lp.technologies,
        ]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(lifecycleSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 11: EVALUACIÓN DE RIESGO
    // ═══════════════════════════════════════════════════════════
    const riskSheet = workbook.addWorksheet('Evaluación de riesgo');
    riskSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(riskSheet, [
      'Código tratamiento', 'Nombre tratamiento', 'Datos especiales', 'Menores', 'Gran escala',
      'Monitoreo sistemático', 'Perfilamiento', 'Decisiones automatizadas', 'Videovigilancia',
      'Geolocalización', 'Biometría', 'Salud', 'Judiciales', 'Transferencia transfronteriza',
      'Alto impacto potencial', 'Alto riesgo', 'Requiere EIPD',
    ]);
    treatments.forEach((t) => {
      const risk = t.riskAssessment;
      if (!risk) return;
      const row = riskSheet.addRow([
        t.code, t.name, risk.usesSpecialCategories ? 'Sí' : 'No', risk.involvesChildren ? 'Sí' : 'No',
        risk.largeScale ? 'Sí' : 'No', risk.systematicMonitoring ? 'Sí' : 'No', risk.profiling ? 'Sí' : 'No',
        risk.automatedDecisions ? 'Sí' : 'No', risk.videoSurveillance ? 'Sí' : 'No', risk.geolocation ? 'Sí' : 'No',
        risk.biometricData ? 'Sí' : 'No', risk.healthData ? 'Sí' : 'No', risk.criminalData ? 'Sí' : 'No',
        risk.crossBorderTransfer ? 'Sí' : 'No', risk.potentialHighImpact ? 'Sí' : 'No',
        t.highRiskFlag ? 'Sí' : 'No', t.requiresDpia ? 'Sí' : 'No',
      ]);
      this.styleDataRow(row, false);
    });
    this.autoWidth(riskSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 12: OBSERVACIONES DPO
    // ═══════════════════════════════════════════════════════════
    const observationsSheet = workbook.addWorksheet('Observaciones DPO');
    observationsSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(observationsSheet, ['Código tratamiento', 'Nombre tratamiento', 'Sección', 'Mensaje', 'Estado', 'Fecha']);
    treatments.forEach((t) => {
      t.observations.forEach((o, idx) => {
        const row = observationsSheet.addRow([t.code, t.name, o.sectionCode, o.message, o.status, this.formatDateTime(o.createdAt)]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(observationsSheet);

    // ═══════════════════════════════════════════════════════════
    // HOJA 13: HISTORIAL DE ESTADOS
    // ═══════════════════════════════════════════════════════════
    const historySheet = workbook.addWorksheet('Historial de estados');
    historySheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    this.styleHeaderRow(historySheet, ['Código tratamiento', 'Nombre tratamiento', 'Estado anterior', 'Nuevo estado', 'Comentario', 'Fecha']);
    treatments.forEach((t) => {
      t.statusHistory.forEach((h, idx) => {
        const row = historySheet.addRow([t.code, t.name, h.previousStatus, h.newStatus, h.comment, this.formatDateTime(h.changedAt)]);
        this.styleDataRow(row, idx % 2 === 0);
      });
    });
    this.autoWidth(historySheet);

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
          @page { size: A4 landscape; margin: 16px; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #111827; }
          h1 { color: #C41E3A; font-size: 22px; text-align: center; margin-bottom: 8px; }
          h2 { color: #1f2937; font-size: 14px; margin-top: 16px; margin-bottom: 8px; border-bottom: 2px solid #C41E3A; padding-bottom: 4px; }
          h3 { color: #1B4D3E; font-size: 12px; margin-top: 12px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
          th, td { border: 1px solid #d1d5db; padding: 5px; text-align: left; vertical-align: top; }
          th { background: #C41E3A; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f3f4f6; }
          .page-break { page-break-before: always; }
          .header-info { text-align: center; margin-bottom: 16px; }
          .header-info p { margin: 2px 0; font-size: 11px; color: #6b7280; }
          .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; }
          .status-aprobado { background: #d1fae5; color: #065f46; }
          .status-validado { background: #d1fae5; color: #065f46; }
          .status-enviado { background: #fef3c7; color: #92400e; }
          .status-observado { background: #fee2e2; color: #991b1b; }
          .status-en_correccion { background: #fee2e2; color: #991b1b; }
          .status-borrador { background: #f3f4f6; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header-info">
          <h1>Registro de Actividades de Tratamiento (RAT)</h1>
          <p><strong>Empresa:</strong> ${treatments[0]?.company?.legalName || ''}</p>
          <p><strong>Total de tratamientos:</strong> ${treatments.length} | <strong>Aprobados:</strong> ${treatments.filter((t) => t.currentStatus === 'aprobado').length} | <strong>En revisión:</strong> ${treatments.filter((t) => ['enviado', 'en_revision_dpo', 'observado', 'en_correccion', 'subsanado'].includes(t.currentStatus)).length}</p>
          <p><strong>Generado:</strong> ${new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
    `;

    treatments.forEach((t, index) => {
      const statusClass = `status-${t.currentStatus}`;
      html += `
        <div class="${index > 0 ? 'page-break' : ''}">
          <h2>${t.code} - ${t.name}</h2>
          <table>
            <tr>
              <th>Área</th><td>${t.area?.name || ''}</td>
              <th>Proceso</th><td>${t.process?.name || ''}</td>
              <th>Estado</th><td><span class="status-badge ${statusClass}">${t.currentStatus}</span></td>
              <th>Riesgo</th><td>${t.riskLevel || 'sin_evaluar'}</td>
            </tr>
            <tr>
              <th>Finalidad principal</th><td colspan="7">${t.mainPurpose || ''}</td>
            </tr>
            <tr>
              <th>Finalidades secundarias</th><td colspan="7">${t.secondaryPurposes || ''}</td>
            </tr>
            <tr>
              <th>Sistema de captura</th><td>${t.captureSystem || ''}</td>
              <th>Sistema de almacenamiento</th><td>${t.storageSystem || ''}</td>
              <th>Tecnologías</th><td colspan="3">${t.technologies || ''}</td>
            </tr>
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
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true, margin: { top: '16px', right: '16px', bottom: '16px', left: '16px' } });
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
