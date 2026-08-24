import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';

export interface LegalBasisEntry {
  article: string;
  label: string;
  selected: boolean;
}

export interface SecurityMeasureEntry {
  name: string;
  status: 'implementada' | 'parcial' | 'no_implementada';
  rawValue: string;
}

export interface SpellingCorrection {
  field: string;
  original: string;
  corrected: string;
}

export interface FormAnalysisResult {
  formInfo: {
    area: string;
    responsible: string;
    email: string;
  };
  description: {
    activityName: { original: string; corrected: string };
    detailedDescription: { original: string; corrected: string };
    purpose: { original: string; corrected: string };
  };
  legalBasis: {
    selected: string;
    allBases: LegalBasisEntry[];
  };
  dataSubjects: {
    subjects: string;
    volume: string;
    dataTypes: string;
    specialCategories: string;
    relationship: { original: string; corrected: string };
  };
  dataFlow: {
    thirdParties: string;
    providerPurpose: string;
    providerData: string;
    subProcessors: string;
    internationalTransfer: boolean;
    frequency: string;
    activeFor: string;
    geographicScope: string;
  };
  retention: {
    period: string;
    hasDeletionProcedure: boolean;
    deletionResponsible: { original: string; corrected: string };
  };
  securityMeasures: SecurityMeasureEntry[];
  dpia: {
    highRisk: boolean;
    dpiaPerformed: boolean;
    specialCase: string;
  };
  ratMapping: {
    name: string;
    mainPurpose: string;
    shortDescription: string;
    processingFrequency: string;
    approximateVolume: string;
    retentionCriteria: string;
    thirdPartiesDescription: string;
    dataCollectionChannel: string;
  };
  spellingCorrections: SpellingCorrection[];
  observations: string[];
  warnings: string[];
}

interface RawFormData {
  area: string;
  responsible: string;
  email: string;
  activityName: string;
  detailedDescription: string;
  purpose: string;
  legalBases: LegalBasisEntry[];
  dataSubjects: string;
  volume: string;
  dataTypes: string;
  specialCategories: string;
  dataRelationship: string;
  thirdParties: string;
  providerPurpose: string;
  providerData: string;
  subProcessors: string;
  internationalTransfer: string;
  frequency: string;
  activeFor: string;
  geographicScope: string;
  retentionPeriod: string;
  hasDeletionProcedure: string;
  deletionResponsible: string;
  securityMeasures: SecurityMeasureEntry[];
  highRisk: string;
  dpiaPerformed: string;
  specialCase: string;
}

@Injectable()
export class FormImportService {
  constructor(private config: ConfigService) {}

  async analyzeForm(buffer: Buffer): Promise<FormAnalysisResult> {
    const raw = await this.parseExcel(buffer);
    const aiResult = await this.callAI(raw);
    return this.buildResult(raw, aiResult);
  }

  private async parseExcel(buffer: Buffer): Promise<RawFormData> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet =
      workbook.getWorksheet('Formulario para Áreas') ||
      workbook.getWorksheet('Hoja1') ||
      workbook.worksheets[0];

    if (!sheet) throw new BadRequestException('No se encontró la hoja del formulario en el archivo Excel.');

    const getCellText = (row: number, col: number): string => {
      const cell = sheet.getCell(row, col);
      if (cell.value === null || cell.value === undefined) return '';
      if (typeof cell.value === 'object' && 'richText' in (cell.value as any)) {
        return (cell.value as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join('').trim();
      }
      return String(cell.value).trim();
    };

    // Find a value by searching for a label in column B, returning value in column D
    const findByLabel = (pattern: RegExp): string => {
      for (let r = 1; r <= Math.min(sheet.rowCount, 100); r++) {
        const label = getCellText(r, 2);
        if (pattern.test(label)) {
          return getCellText(r, 4);
        }
      }
      return '';
    };

    const isChecked = (value: string): boolean =>
      value.includes('☑') || /\bSí\b/i.test(value) || /\bsi\b/i.test(value);

    const legalBases: LegalBasisEntry[] = [
      { article: 'Art. 7.1', label: 'Consentimiento del titular', row: 17 },
      { article: 'Art. 7.2', label: 'Obligación legal', row: 18 },
      { article: 'Art. 7.3', label: 'Orden judicial', row: 19 },
      { article: 'Art. 7.4', label: 'Misión de interés público o ejercicio de poderes públicos', row: 20 },
      { article: 'Art. 7.5', label: 'Ejecución de medidas precontractuales o de obligaciones contractuales', row: 21 },
      { article: 'Art. 7.6', label: 'Interés vital', row: 22 },
      { article: 'Art. 7.7', label: 'Bases de datos de acceso público', row: 23 },
      { article: 'Art. 7.8', label: 'Interés legítimo', row: 24 },
    ].map(({ article, label, row }) => ({
      article,
      label,
      selected: isChecked(getCellText(row, 4)),
    }));

    const parseSecurityStatus = (value: string): 'implementada' | 'parcial' | 'no_implementada' => {
      if (value.includes('☑') || /implementada/i.test(value)) return 'implementada';
      if (value.includes('⚠') || /parcial/i.test(value)) return 'parcial';
      return 'no_implementada';
    };

    const securityMeasures: SecurityMeasureEntry[] = [
      { name: 'Control de acceso (usuarios y contraseñas)', row: 51 },
      { name: 'Cifrado de datos (en reposo o en tránsito)', row: 52 },
      { name: 'Copias de seguridad (backup)', row: 53 },
      { name: 'Acuerdos de confidencialidad firmados', row: 54 },
      { name: 'Formación en protección de datos', row: 55 },
      { name: 'Registro de accesos / auditoría', row: 56 },
    ].map(({ name, row }) => {
      const rawValue = getCellText(row, 4);
      return { name, status: parseSecurityStatus(rawValue), rawValue };
    });

    return {
      area: findByLabel(/Nombre del Área/i),
      responsible: findByLabel(/Responsable del Área/i),
      email: findByLabel(/Correo electrónico/i),
      activityName: findByLabel(/Nombre de la actividad de tratamiento/i),
      detailedDescription: findByLabel(/Descripción detallada de la actividad/i),
      purpose: findByLabel(/FINALIDAD del tratamiento/i),
      legalBases,
      dataSubjects: findByLabel(/pertenecen los datos/i),
      volume: findByLabel(/Número aproximado de personas/i),
      dataTypes: findByLabel(/tipos de datos se tratan/i),
      specialCategories: findByLabel(/categorías especiales/i),
      dataRelationship: findByLabel(/relaciona su área con los titulares/i),
      thirdParties: findByLabel(/comparten los datos con encargados/i),
      providerPurpose: findByLabel(/Para qué se contrató a este proveedor/i),
      providerData: findByLabel(/datos de los señalados en la sección 3/i),
      subProcessors: findByLabel(/subencargados/i),
      internationalTransfer: findByLabel(/transfieren datos fuera de Ecuador/i),
      frequency: findByLabel(/frecuencia realiza estas operaciones/i),
      activeFor: findByLabel(/tiempo lleva activo este tratamiento/i),
      geographicScope: findByLabel(/ámbito geográfico afecta/i),
      retentionPeriod: findByLabel(/tiempo se conservan los datos/i),
      hasDeletionProcedure: findByLabel(/procedimiento de eliminación/i),
      deletionResponsible: findByLabel(/cargo ejecutará el borrado/i),
      securityMeasures,
      highRisk: findByLabel(/alto riesgo para las personas/i),
      dpiaPerformed: findByLabel(/realizado una EIPD/i),
      specialCase: findByLabel(/caso especial de la ley/i),
    };
  }

  private async callAI(raw: RawFormData): Promise<{
    corrections: Record<string, string>;
    ratFields: Record<string, string>;
    observations: string[];
    warnings: string[];
  }> {
    const apiKey = this.config.get('OPENAI_API_KEY');

    const formSummary = `
Área / Departamento: ${raw.area}
Responsable: ${raw.responsible}
Email: ${raw.email}

SECCIÓN 1 - DESCRIPCIÓN:
- Nombre actividad: ${raw.activityName}
- Descripción detallada: ${raw.detailedDescription}
- Finalidad: ${raw.purpose}

SECCIÓN 2 - BASE JURÍDICA:
${raw.legalBases.map((b) => `- ${b.article} ${b.label}: ${b.selected ? 'SELECCIONADA' : 'No'}`).join('\n')}

SECCIÓN 3 - INTERESADOS:
- Titulares: ${raw.dataSubjects}
- Volumen (últimos 12 meses): ${raw.volume}
- Tipos de datos: ${raw.dataTypes}
- Categorías especiales: ${raw.specialCategories}
- Relación con titulares: ${raw.dataRelationship}

SECCIÓN 4 - FLUJO DE DATOS:
- Encargados/proveedores: ${raw.thirdParties}
- Finalidad del proveedor: ${raw.providerPurpose}
- Datos tratados por proveedor: ${raw.providerData}
- Sub-encargados: ${raw.subProcessors}
- Transferencia internacional: ${raw.internationalTransfer}
- Frecuencia: ${raw.frequency}
- Tiempo activo: ${raw.activeFor}
- Ámbito geográfico: ${raw.geographicScope}

SECCIÓN 5 - CONSERVACIÓN:
- Período de conservación: ${raw.retentionPeriod}
- Procedimiento borrado: ${raw.hasDeletionProcedure}
- Responsable borrado: ${raw.deletionResponsible}

SECCIÓN 6 - MEDIDAS DE SEGURIDAD:
${raw.securityMeasures.map((m) => `- ${m.name}: ${m.rawValue}`).join('\n')}

SECCIÓN 7 - EIPD:
- Alto riesgo: ${raw.highRisk}
- EIPD realizada: ${raw.dpiaPerformed}
- Caso especial: ${raw.specialCase}`;

    if (!apiKey) {
      return this.fallbackAI(raw);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un experto en protección de datos personales y la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador. Tu tarea es analizar formularios de levantamiento de actividades de tratamiento.

Responde ÚNICAMENTE con JSON válido, sin texto adicional antes o después.`,
            },
            {
              role: 'user',
              content: `Analiza este formulario de levantamiento RAT y devuelve un JSON con la siguiente estructura exacta:

${formSummary}

Devuelve este JSON exacto:
{
  "corrections": {
    "activityName": "nombre de actividad con ortografía corregida",
    "detailedDescription": "descripción detallada con ortografía y redacción corregidas",
    "purpose": "finalidad con ortografía corregida",
    "dataRelationship": "relación con titulares corregida",
    "deletionResponsible": "cargo con ortografía corregida"
  },
  "ratFields": {
    "name": "nombre formal y profesional para el RAT",
    "mainPurpose": "finalidad principal redactada profesionalmente en 3-4 oraciones con lenguaje corporativo formal, indicando qué datos se tratan, para qué y la base legal",
    "shortDescription": "descripción breve del tratamiento en 1-2 oraciones",
    "processingFrequency": "frecuencia normalizada (ej: Periódica, Diaria, Mensual)",
    "approximateVolume": "volumen con unidad (ej: 132 personas/año)",
    "retentionCriteria": "criterio de conservación redactado profesionalmente mencionando la obligación legal y el período",
    "thirdPartiesDescription": "descripción del encargado/proveedor con datos clave",
    "dataCollectionChannel": "canal o medio de obtención de los datos"
  },
  "observations": [
    "observación 1 sobre el cumplimiento",
    "observación 2"
  ],
  "warnings": [
    "alerta 1 sobre riesgos o brechas detectadas",
    "alerta 2"
  ]
}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.fallbackAI(raw);
    } catch {
      return this.fallbackAI(raw);
    }
  }

  private fallbackAI(raw: RawFormData): {
    corrections: Record<string, string>;
    ratFields: Record<string, string>;
    observations: string[];
    warnings: string[];
  } {
    const corrections: Record<string, string> = {
      activityName: raw.activityName,
      detailedDescription: raw.detailedDescription,
      purpose: raw.purpose,
      dataRelationship: raw.dataRelationship,
      deletionResponsible: raw.deletionResponsible,
    };

    const selectedBasis = raw.legalBases.find((b) => b.selected);
    const observations: string[] = [];
    const warnings: string[] = [];

    if (!selectedBasis) {
      warnings.push('No se ha identificado una base jurídica seleccionada en el formulario.');
    } else {
      observations.push(`Base jurídica identificada: ${selectedBasis.article} - ${selectedBasis.label}.`);
    }

    if (raw.retentionPeriod.toLowerCase().includes('indefinido')) {
      warnings.push('El período de conservación indicado es "indefinido". La LOPDP exige definir plazos concretos de retención alineados con la finalidad del tratamiento.');
    }

    if (raw.hasDeletionProcedure.toLowerCase().includes('no')) {
      warnings.push('No existe un procedimiento formal de eliminación/borrado seguro de datos. Se recomienda establecer uno conforme al Art. 19 LOPDP.');
    }

    const partialMeasures = raw.securityMeasures.filter((m) => m.status === 'parcial');
    if (partialMeasures.length > 0) {
      warnings.push(`Medidas de seguridad parciales detectadas: ${partialMeasures.map((m) => m.name).join(', ')}. Se recomienda implementarlas completamente.`);
    }

    if (raw.specialCase && raw.dpiaPerformed.toLowerCase().includes('no')) {
      warnings.push(`Se identificó el caso especial "${raw.specialCase}" pero no se ha realizado una Evaluación de Impacto (EIPD). Evalúe si es obligatoria según el Art. 39 LOPDP.`);
    }

    observations.push(`Titulares de datos: ${raw.dataSubjects}. Volumen aproximado: ${raw.volume} personas.`);
    observations.push(`Ámbito geográfico del tratamiento: ${raw.geographicScope}.`);

    if (raw.thirdParties && !raw.thirdParties.toLowerCase().includes('no')) {
      observations.push(`Se identificó encargado del tratamiento: ${raw.thirdParties}. Verifique que exista contrato de encargo de tratamiento conforme al Art. 37 LOPDP.`);
    }

    return {
      corrections,
      ratFields: {
        name: raw.activityName,
        mainPurpose: raw.purpose || `Tratamiento de datos personales de ${raw.dataSubjects} con la finalidad de ${raw.purpose || 'gestionar las operaciones del área'}, en el marco de las obligaciones contractuales y legales aplicables.`,
        shortDescription: `Actividad de tratamiento del área de ${raw.area} que gestiona datos de ${raw.dataSubjects}.`,
        processingFrequency: raw.frequency || 'Periódica',
        approximateVolume: raw.volume ? `${raw.volume} personas` : 'No especificado',
        retentionCriteria: raw.retentionPeriod || 'Según obligación legal aplicable',
        thirdPartiesDescription: raw.thirdParties && !raw.thirdParties.toLowerCase().includes('no') ? `${raw.thirdParties} - ${raw.providerPurpose}` : 'No aplica',
        dataCollectionChannel: 'Documentación física y sistemas internos (Siscore/SAP)',
      },
      observations,
      warnings,
    };
  }

  private buildResult(raw: RawFormData, ai: { corrections: Record<string, string>; ratFields: Record<string, string>; observations: string[]; warnings: string[] }): FormAnalysisResult {
    const spellingCorrections: SpellingCorrection[] = [];

    const addCorrection = (field: string, original: string, corrected: string) => {
      if (corrected && original !== corrected) {
        spellingCorrections.push({ field, original, corrected });
      }
    };

    addCorrection('Nombre de la actividad', raw.activityName, ai.corrections.activityName || raw.activityName);
    addCorrection('Descripción detallada', raw.detailedDescription, ai.corrections.detailedDescription || raw.detailedDescription);
    addCorrection('Finalidad', raw.purpose, ai.corrections.purpose || raw.purpose);
    addCorrection('Relación con titulares', raw.dataRelationship, ai.corrections.dataRelationship || raw.dataRelationship);
    addCorrection('Responsable del borrado', raw.deletionResponsible, ai.corrections.deletionResponsible || raw.deletionResponsible);

    const selectedBasis = raw.legalBases.find((b) => b.selected);

    return {
      formInfo: {
        area: raw.area,
        responsible: raw.responsible,
        email: raw.email,
      },
      description: {
        activityName: {
          original: raw.activityName,
          corrected: ai.corrections.activityName || raw.activityName,
        },
        detailedDescription: {
          original: raw.detailedDescription,
          corrected: ai.corrections.detailedDescription || raw.detailedDescription,
        },
        purpose: {
          original: raw.purpose,
          corrected: ai.corrections.purpose || raw.purpose,
        },
      },
      legalBasis: {
        selected: selectedBasis ? `${selectedBasis.article} - ${selectedBasis.label}` : 'No seleccionada',
        allBases: raw.legalBases,
      },
      dataSubjects: {
        subjects: raw.dataSubjects,
        volume: raw.volume,
        dataTypes: raw.dataTypes,
        specialCategories: raw.specialCategories,
        relationship: {
          original: raw.dataRelationship,
          corrected: ai.corrections.dataRelationship || raw.dataRelationship,
        },
      },
      dataFlow: {
        thirdParties: raw.thirdParties,
        providerPurpose: raw.providerPurpose,
        providerData: raw.providerData,
        subProcessors: raw.subProcessors,
        internationalTransfer: /\bno\b/i.test(raw.internationalTransfer) ? false : true,
        frequency: raw.frequency,
        activeFor: raw.activeFor,
        geographicScope: raw.geographicScope,
      },
      retention: {
        period: raw.retentionPeriod,
        hasDeletionProcedure: !/\bno\b/i.test(raw.hasDeletionProcedure),
        deletionResponsible: {
          original: raw.deletionResponsible,
          corrected: ai.corrections.deletionResponsible || raw.deletionResponsible,
        },
      },
      securityMeasures: raw.securityMeasures,
      dpia: {
        highRisk: !/\bno\b/i.test(raw.highRisk),
        dpiaPerformed: !/\bno\b/i.test(raw.dpiaPerformed),
        specialCase: raw.specialCase,
      },
      ratMapping: {
        name: ai.ratFields.name || raw.activityName,
        mainPurpose: ai.ratFields.mainPurpose || raw.purpose,
        shortDescription: ai.ratFields.shortDescription || '',
        processingFrequency: ai.ratFields.processingFrequency || raw.frequency,
        approximateVolume: ai.ratFields.approximateVolume || raw.volume,
        retentionCriteria: ai.ratFields.retentionCriteria || raw.retentionPeriod,
        thirdPartiesDescription: ai.ratFields.thirdPartiesDescription || '',
        dataCollectionChannel: ai.ratFields.dataCollectionChannel || '',
      },
      spellingCorrections,
      observations: ai.observations || [],
      warnings: ai.warnings || [],
    };
  }
}
