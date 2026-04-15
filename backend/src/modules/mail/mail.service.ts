import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || '',
      port: Number(this.config.get('SMTP_PORT')) || 587,
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER') || '',
        pass: this.config.get('SMTP_PASS') || '',
      },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'noreply@servientrega-rat.com',
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
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'noreply@servientrega-rat.com',
      to,
      subject,
      html,
    });
  }
}
