import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  private readonly isConfigured: boolean;

  constructor(private config: ConfigService) {
    const smtpHost = this.config.get('SMTP_HOST');
    const smtpPort = Number(this.config.get('SMTP_PORT'));
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');

    this.isConfigured = !!(smtpHost && smtpUser && smtpPass);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: false, // Outlook 587 usa STARTTLS (false), 465 usaría SSL (true)
        requireTLS: true, // Obliga TLS para Outlook
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      console.warn('[MailService] Configuración SMTP incompleta. El envío de correos está deshabilitado.');
    }
  }

  private getFromAddress(): string {
    // Siempre usa el correo del DPO como remitente
    return this.config.get('SMTP_USER') || 'dpo@servientrega.com.ec';
  }

  async sendPasswordReset(email: string, token: string) {
    if (!this.isConfigured) {
      console.warn(`[MailService] No se envió correo de recuperación a ${email} porque SMTP no está configurado.`);
      return;
    }
    const frontendUrl = this.config.get('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL no está configurada');
    }
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const from = this.getFromAddress();

    await this.transporter.sendMail({
      from: `"DPO Servientrega" <${from}>`,
      to: email,
      subject: 'Recuperación de contraseña - RAT Servientrega',
      html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <hr/>
        <p style="font-size:11px;color:#666;">Este correo fue enviado por el Delegado de Protección de Datos de Servientrega.</p>
      `,
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.isConfigured) {
      console.warn(`[MailService] No se envió correo a ${to} porque SMTP no está configurado.`);
      return;
    }
    const from = this.getFromAddress();
    await this.transporter.sendMail({
      from: `"DPO Servientrega" <${from}>`,
      to,
      subject,
      html: `${html}<hr/><p style="font-size:11px;color:#666;">Este correo fue enviado por el Delegado de Protección de Datos de Servientrega.</p>`,
    });
  }
}
