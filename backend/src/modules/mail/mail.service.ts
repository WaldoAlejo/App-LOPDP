import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const smtpHost = this.config.get('SMTP_HOST');
    const smtpPort = Number(this.config.get('SMTP_PORT'));
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('Configuración SMTP incompleta. Verifique SMTP_HOST, SMTP_USER y SMTP_PASS.');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const frontendUrl = this.config.get('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL no está configurada');
    }
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const from = this.config.get('SMTP_FROM');
    if (!from) {
      throw new Error('SMTP_FROM no está configurado');
    }

    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Recuperación de contraseña - RAT Servientrega',
      html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.config.get('SMTP_FROM');
    if (!from) {
      throw new Error('SMTP_FROM no está configurado');
    }
    await this.transporter.sendMail({ from, to, subject, html });
  }
}
