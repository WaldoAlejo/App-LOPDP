import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SuggestDto {
  field: string;
  treatmentName?: string;
  mainPurpose?: string;
  currentValue?: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class AiAssistantService {
  constructor(private config: ConfigService) {}

  private getSystemPrompt(field: string): string {
    const prompts: Record<string, string> = {
      mainPurpose: `Eres un experto en protección de datos personales y la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.
Tu tarea es ayudar a redactar la FINALIDAD PRINCIPAL de un tratamiento de datos personales.

Reglas:
- Sé claro, conciso y profesional
- Describe QUÉ se hace con los datos y PARA QUÉ
- Incluye la base legal cuando sea relevante
- Máximo 3-4 oraciones
- Usa lenguaje corporativo formal

Ejemplo bueno: "Recopilar y procesar datos personales de clientes para gestionar el servicio de mensajería, realizar entregas puerta a puerta, mantener comunicación sobre el estado de envíos y cumplir con obligaciones contractuales y legales de transporte."

Ejemplo malo: "Tener datos de clientes" (muy vago)`,

      secondaryPurposes: `Eres un experto en protección de datos personales.
Ayuda a identificar FINALIDADES SECUNDARIAS de un tratamiento de datos.

Considera:
- Análisis estadístico interno
- Mejora de servicios
- Prevención de fraude
- Cumplimiento regulatorio
- Marketing (solo si hay consentimiento)
- Auditoría interna

Sé específico y menciona solo las que apliquen al contexto.`,

      aiSystemDescription: `Eres un experto en protección de datos y sistemas de IA.
Describe un sistema de IA/procesamiento automatizado de datos personales.

Incluye:
- Tipo de tecnología (ML, NLP, reglas, etc.)
- Qué datos procesa
- Cómo funciona a alto nivel
- Medidas de transparencia
- Derechos del titular respecto a decisiones automatizadas

Sé técnico pero comprensible.`,

      profilingDescription: `Eres un experto en protección de datos.
Describe un proceso de PERFILADO de datos personales.

Incluye:
- Qué características se analizan
- Qué perfiles se generan
- Para qué se usan los perfiles
- Impacto en el titular
- Medidas de salvaguarda

Sé específico y ético en la descripción.`,

      retentionCriteria: `Eres un experto en protección de datos.
Define criterios de conservación/retención de datos personales.

Considera:
- Plazos legales obligatorios
- Duración del contrato/servicio
- Necesidades operativas
- Posibles reclamaciones o litigios
- Anonimización como alternativa a borrado

Sé preciso con los plazos y justifica cada uno.`,

      activityDescription: `Eres un experto en protección de datos.
Describe una actividad específica dentro del ciclo de vida de un tratamiento de datos.

Incluye:
- Qué se hace en esta fase
- Quién participa
- Qué datos se procesan
- Dónde ocurre
- Medidas de seguridad aplicables

Sé detallado pero conciso.`,

      default: `Eres un experto en protección de datos personales y la LOPDP del Ecuador.
Ayuda a redactar contenido profesional, claro y regulatoriamente correcto para el registro de actividades de tratamiento (RAT).
Sé conciso, específico y usa lenguaje corporativo formal.`,
    };

    return prompts[field] || prompts.default;
  }

  async suggest(dto: {
    field: string;
    treatmentName?: string;
    mainPurpose?: string;
    currentValue?: string;
    context?: Record<string, any>;
  }): Promise<{ suggestion: string }> {
    const apiKey = this.config.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      // Modo fallback: generar sugerencias basadas en reglas
      return this.fallbackSuggest(dto);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this.getSystemPrompt(dto.field) },
            { role: 'user', content: this.buildUserPrompt(dto) },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const suggestion = data.choices?.[0]?.message?.content?.trim() || '';
      
      return { suggestion };
    } catch (error) {
      return this.fallbackSuggest(dto);
    }
  }

  async validate(dto: { treatment: Record<string, any> }): Promise<{
    isValid: boolean;
    score: number;
    observations: string[];
    suggestions: string[];
  }> {
    const apiKey = this.config.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return this.fallbackValidate(dto.treatment);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un auditor experto en la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.
Analiza el siguiente tratamiento de datos y evalúa su cumplimiento regulatorio.

Responde SOLO en formato JSON con esta estructura:
{
  "isValid": boolean,
  "score": number (0-100),
  "observations": ["observación 1", "observación 2"],
  "suggestions": ["sugerencia 1", "sugerencia 2"]
}

Criterios de evaluación:
- Finalidad clara y legítima
- Base legal apropiada
- Datos mínimos necesarios
- Medidas de seguridad adecuadas
- Plazos de retención definidos
- Derechos de los titulares garantizados`,
            },
            {
              role: 'user',
              content: `Tratamiento a evaluar:\n${JSON.stringify(dto.treatment, null, 2)}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '{}';
      
      // Extraer JSON de la respuesta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackValidate(dto.treatment);
      
      return result;
    } catch (error) {
      return this.fallbackValidate(dto.treatment);
    }
  }

  async chat(dto: { message: string; context?: Record<string, any> }): Promise<{ response: string }> {
    const apiKey = this.config.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return { response: 'El asistente de IA requiere configuración de API key. Contacte al administrador.' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un asistente experto en protección de datos personales y la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.

Tu rol es ayudar a los usuarios de Servientrega Ecuador con:
- Dudas sobre la LOPDP
- Cómo completar el Registro de Actividades de Tratamiento (RAT)
- Mejores prácticas de protección de datos
- Derechos de los titulares de datos
- Medidas de seguridad recomendadas

Responde en español, de forma clara, profesional y concisa.
Si no sabes algo, indícalo honestamente.

Contexto actual del usuario: ${dto.context ? JSON.stringify(dto.context) : 'No disponible'}`,
            },
            { role: 'user', content: dto.message },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      const response_text = data.choices?.[0]?.message?.content?.trim() || '';
      
      return { response: response_text };
    } catch (error) {
      return { response: 'Lo siento, el servicio de IA no está disponible en este momento. Por favor intente más tarde.' };
    }
  }

  private buildUserPrompt(dto: SuggestDto): string {
    let prompt = `Campo a completar: ${dto.field}\n`;
    if (dto.treatmentName) prompt += `Nombre del tratamiento: ${dto.treatmentName}\n`;
    if (dto.mainPurpose) prompt += `Finalidad principal: ${dto.mainPurpose}\n`;
    if (dto.currentValue) prompt += `Valor actual (puede mejorarse): ${dto.currentValue}\n`;
    if (dto.context) prompt += `Contexto adicional: ${JSON.stringify(dto.context)}\n`;
    prompt += '\nPor favor, proporciona una sugerencia profesional y completa.';
    return prompt;
  }

  private fallbackSuggest(dto: SuggestDto): { suggestion: string } {
    const fallbacks: Record<string, string> = {
      mainPurpose: `Gestionar los datos personales de [titulares] para [actividad específica], garantizando el cumplimiento de las obligaciones contractuales, legales y regulatorias establecidas en la normativa ecuatoriana de protección de datos personales.`,
      secondaryPurposes: `1. Análisis estadístico interno para mejora continua de procesos\n2. Prevención de fraude y seguridad de la información\n3. Cumplimiento de obligaciones regulatorias y auditorías internas`,
      aiSystemDescription: `El sistema utiliza algoritmos de procesamiento automatizado para [descripción específica]. Los datos son procesados de forma segura, con medidas de transparencia y garantía de derechos del titular, conforme a la LOPDP del Ecuador.`,
      profilingDescription: `Se realiza análisis de patrones de comportamiento para [finalidad específica], sin generar decisiones automatizadas que afecten derechos fundamentales del titular. El titular puede ejercer su derecho de oposición en cualquier momento.`,
      retentionCriteria: `Los datos serán conservados durante el tiempo necesario para cumplir con la finalidad del tratamiento y las obligaciones legales aplicables. Posteriormente, serán anonimizados o eliminados de forma segura conforme a los procedimientos establecidos.`,
      activityDescription: `En esta fase se realiza [actividad específica] con los datos personales, involucrando a [responsables] y aplicando las medidas de seguridad correspondientes para garantizar la confidencialidad, integridad y disponibilidad de la información.`,
    };

    return { suggestion: fallbacks[dto.field] || fallbacks.mainPurpose };
  }

  private fallbackValidate(treatment: Record<string, unknown>): {
    isValid: boolean;
    score: number;
    observations: string[];
    suggestions: string[];
  } {
    const observations: string[] = [];
    const suggestions: string[] = [];
    let score = 70;

    if (!(treatment.name as string)?.length || (treatment.name as string).length < 10) {
      observations.push('El nombre del tratamiento es muy corto o genérico');
      suggestions.push('Use un nombre descriptivo que indique claramente qué datos se tratan y para qué');
      score -= 10;
    }

    if (!(treatment.mainPurpose as string)?.length || (treatment.mainPurpose as string).length < 20) {
      observations.push('La finalidad principal no está suficientemente detallada');
      suggestions.push('Describa específicamente qué se hace con los datos y para qué finalidad');
      score -= 15;
    }

    if (!(treatment.dataItems as unknown[])?.length) {
      observations.push('No se han definido los datos personales tratados');
      suggestions.push('Identifique todos los datos personales que se procesan en esta actividad');
      score -= 20;
    }

    if (!(treatment.legalBases as unknown[])?.length) {
      observations.push('No se ha establecido la base legal del tratamiento');
      suggestions.push('Defina la base legal que autoriza el tratamiento (ejecución de contrato, consentimiento, obligación legal, interés legítimo)');
      score -= 15;
    }

    if (!(treatment.securityMeasures as unknown[])?.length) {
      observations.push('No se han definido medidas de seguridad');
      suggestions.push('Documente las medidas técnicas y organizativas implementadas para proteger los datos');
      score -= 10;
    }

    return {
      isValid: score >= 60,
      score: Math.max(0, score),
      observations,
      suggestions,
    };
  }
}
