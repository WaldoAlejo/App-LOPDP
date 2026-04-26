import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailConfigService } from '../email-config/email-config.service';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';

interface ObservationInfo {
  sectionCode: string;
  message: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private emailConfigService: EmailConfigService,
    private config: ConfigService,
  ) {}

  private getFrontendUrl(): string {
    return this.config.get('FRONTEND_URL') || 'http://localhost:5173';
  }

  private async createTransporter(companyId: string) {
    const config = await this.emailConfigService.getSmtpConfig(companyId);
    if (!config || !config.isActive) {
      this.logger.warn(`No hay configuración de correo activa para la empresa ${companyId}`);
      return null;
    }

    const nodemailer = await import('nodemailer');
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      requireTLS: config.smtpPort === 587,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
  }

  private async sendEmail(companyId: string, to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = await this.createTransporter(companyId);
      if (!transporter) return false;

      const config = await this.emailConfigService.getSmtpConfig(companyId);
      const from = config?.smtpFrom || config?.smtpUser || 'noreply@servientrega-rat.com';

      await transporter.sendMail({
        from: `"RAT Servientrega" <${from}>`,
        to,
        subject,
        html: `${html}<hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" /><p style="font-size: 11px; color: #888;">Este correo fue enviado automáticamente por el sistema RAT - Servientrega. Por favor no responda a este mensaje.</p>`,
      });

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error enviando correo a ${to}: ${message}`);
      return false;
    }
  }

  // ─── NOTIFICACIÓN: Nueva observación ───
  async notifyNewObservation(treatmentId: string, observation: ObservationInfo, creatorUser: CurrentUser) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { company: true },
    });

    if (!treatment) return;

    // Buscar al creador del tratamiento
    const creator = await this.prisma.user.findUnique({
      where: { id: treatment.createdByUserId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!creator?.email) return;

    const sectionLabels: Record<string, string> = {
      identificacion: 'Identificación',
      finalidad: 'Finalidad',
      titulares: 'Titulares de datos',
      datos: 'Datos personales',
      base_legal: 'Base legal',
      tecnologias: 'Tecnologías',
      terceros: 'Terceros',
      transferencias: 'Transferencias',
      conservacion: 'Conservación',
      seguridad: 'Seguridad',
      ciclo_vida: 'Ciclo de vida',
      riesgo: 'Riesgo',
    };

    const sectionName = sectionLabels[observation.sectionCode] || observation.sectionCode;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #C41E3A; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🔍 Nueva Observación DPO</h2>
        </div>
        <div style="padding: 20px; background: #fff;">
          <p>Hola <strong>${creator.firstName}</strong>,</p>
          <p>El DPO ha realizado una observación en tu tratamiento:</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #C41E3A; padding: 15px; margin: 15px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;"><strong>Tratamiento:</strong> ${treatment.code} - ${treatment.name}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;"><strong>Sección:</strong> ${sectionName}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #333;"><em>"${observation.message}"</em></p>
          </div>

          <p><strong>¿Qué debes hacer?</strong></p>
          <ol>
            <li>Ingresa al sistema RAT</li>
            <li>Ve a la sección <strong>"${sectionName}"</strong> del tratamiento</li>
            <li>Corrige lo indicado en la observación</li>
            <li>Marca la observación como corregida</li>
          </ol>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${this.getFrontendUrl()}/treatments/${treatment.id}/edit" 
               style="background: #C41E3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ir al tratamiento
            </a>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail(treatment.companyId, creator.email, `🔍 Nueva observación en ${treatment.code}`, html);
  }

  // ─── NOTIFICACIÓN: Cambio de estado ───
  async notifyStatusChange(treatmentId: string, newStatus: string, comment?: string, changedBy?: CurrentUser) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { company: true },
    });

    if (!treatment) return;

    // Buscar al creador y DPO
    const creator = await this.prisma.user.findUnique({
      where: { id: treatment.createdByUserId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const dpo = treatment.dpoId
      ? await this.prisma.user.findUnique({
          where: { id: treatment.dpoId },
          select: { id: true, email: true, firstName: true, lastName: true },
        })
      : null;

    const statusLabels: Record<string, { label: string; color: string; emoji: string; description: string }> = {
      borrador: { label: 'Borrador', color: '#6B7280', emoji: '📝', description: 'El tratamiento está en borrador.' },
      en_edicion: { label: 'En edición', color: '#6B7280', emoji: '✏️', description: 'El tratamiento está siendo editado.' },
      enviado: { label: 'Enviado', color: '#3B82F6', emoji: '📤', description: 'El tratamiento ha sido enviado para revisión DPO.' },
      en_revision_dpo: { label: 'En revisión DPO', color: '#F59E0B', emoji: '👀', description: 'El DPO está revisando el tratamiento.' },
      observado: { label: 'Observado', color: '#EF4444', emoji: '⚠️', description: 'El DPO ha encontrado observaciones que deben corregirse.' },
      en_correccion: { label: 'En corrección', color: '#F97316', emoji: '🔧', description: 'El tratamiento está siendo corregido.' },
      subsanado: { label: 'Subsanado', color: '#10B981', emoji: '✅', description: 'Las correcciones han sido realizadas.' },
      validado: { label: 'Validado', color: '#10B981', emoji: '✅', description: 'El tratamiento ha sido validado por el DPO.' },
      aprobado: { label: 'Aprobado', color: '#059669', emoji: '🎉', description: '¡El tratamiento ha sido aprobado!' },
      rechazado: { label: 'Rechazado', color: '#DC2626', emoji: '❌', description: 'El tratamiento ha sido rechazado.' },
      requiere_eipd: { label: 'Requiere EIPD', color: '#7C3AED', emoji: '📋', description: 'Se requiere una Evaluación de Impacto en Protección de Datos.' },
      archivado: { label: 'Archivado', color: '#6B7280', emoji: '📦', description: 'El tratamiento ha sido archivado.' },
    };

    const status = statusLabels[newStatus] || { label: newStatus, color: '#6B7280', emoji: '📋', description: '' };

    // Notificar al creador del tratamiento
    if (creator?.email && creator.id !== changedBy?.userId) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${status.color}; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">${status.emoji} Estado actualizado: ${status.label}</h2>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p>Hola <strong>${creator.firstName}</strong>,</p>
            <p>El estado de tu tratamiento ha cambiado:</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid ${status.color}; padding: 15px; margin: 15px 0;">
              <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>${treatment.code}</strong> - ${treatment.name}</p>
              <p style="margin: 0; font-size: 18px; color: ${status.color};"><strong>${status.emoji} ${status.label}</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${status.description}</p>
            </div>

            ${comment ? `<div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 10px; margin: 15px 0; border-radius: 5px;"><p style="margin: 0; font-size: 12px; color: #92400e;"><strong>Comentario:</strong> ${comment}</p></div>` : ''}

            <div style="text-align: center; margin: 25px 0;">
              <a href="${this.getFrontendUrl()}/treatments/${treatment.id}/edit" 
                 style="background: ${status.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver tratamiento
              </a>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail(treatment.companyId, creator.email, `${status.emoji} ${treatment.code} - ${status.label}`, html);
    }

    // Notificar al DPO si el estado es 'enviado' o 'subsanado'
    if (['enviado', 'subsanado'].includes(newStatus) && dpo?.email) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3B82F6; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">📋 Tratamiento pendiente de revisión</h2>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p>Hola <strong>${dpo.firstName || 'DPO'}</strong>,</p>
            <p>Un tratamiento requiere tu revisión:</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #3B82F6; padding: 15px; margin: 15px 0;">
              <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>${treatment.code}</strong> - ${treatment.name}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Estado: <strong>${status.label}</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Creado por: ${creator?.firstName || ''} ${creator?.lastName || ''}</p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${this.getFrontendUrl()}/reviews/${treatment.id}" 
                 style="background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Revisar tratamiento
              </a>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail(treatment.companyId, dpo.email, `📋 Revisión pendiente: ${treatment.code}`, html);
    }
  }

  // ─── NOTIFICACIÓN: Observación resuelta ───
  async notifyObservationResolved(observationId: string, resolverUser: CurrentUser) {
    const observation = await this.prisma.observation.findUnique({
      where: { id: observationId },
      include: { treatment: { include: { company: true } } },
    });

    if (!observation) return;

    // Buscar al creador de la observación
    const creator = await this.prisma.user.findUnique({
      where: { id: observation.createdByUserId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!creator?.email) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">✅ Observación resuelta</h2>
        </div>
        <div style="padding: 20px; background: #fff;">
          <p>Hola <strong>${creator.firstName}</strong>,</p>
          <p>Una observación que creaste ha sido marcada como resuelta:</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;"><strong>Tratamiento:</strong> ${observation.treatment.code} - ${observation.treatment.name}</p>
            <p style="margin: 0; font-size: 14px; color: #333;"><em>"${observation.message}"</em></p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #059669;"><strong>✅ Resuelta por:</strong> ${resolverUser.firstName} ${resolverUser.lastName}</p>
          </div>
        </div>
      </div>
    `;

    await this.sendEmail(
      observation.treatment.companyId,
      creator.email,
      `✅ Observación resuelta en ${observation.treatment.code}`,
      html,
    );
  }
}
