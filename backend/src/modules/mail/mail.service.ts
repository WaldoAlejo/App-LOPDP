import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private async getTransporter(companyId?: string): Promise<nodemailer.Transporter | null> {
    // 1. Primero intentar obtener configuración de la base de datos
    let dbConfig = null;
    
    if (companyId) {
      dbConfig = await this.prisma.emailConfig.findUnique({
        where: { companyId },
      });
    }
    
    // Si no hay config para esa empresa, buscar cualquier config activa
    if (!dbConfig) {
      dbConfig = await this.prisma.emailConfig.findFirst({
        where: { isActive: true },
      });
    }
    
    if (dbConfig && dbConfig.isActive) {
      return nodemailer.createTransport({
        host: dbConfig.smtpHost,
        port: dbConfig.smtpPort,
        secure: dbConfig.smtpPort === 465,
        requireTLS: dbConfig.smtpPort === 587,
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        auth: { user: dbConfig.smtpUser, pass: dbConfig.smtpPass },
      });
    }

    // 2. Fallback a variables de entorno
    const smtpHost = this.config.get('SMTP_HOST');
    const smtpPort = Number(this.config.get('SMTP_PORT'));
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: false,
        requireTLS: true,
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        auth: { user: smtpUser, pass: smtpPass },
      });
    }

    return null;
  }

  private async getFromAddress(companyId?: string): Promise<string> {
    let dbConfig = null;
    
    if (companyId) {
      dbConfig = await this.prisma.emailConfig.findUnique({
        where: { companyId },
        select: { smtpFrom: true, smtpUser: true },
      });
    }
    
    if (!dbConfig) {
      dbConfig = await this.prisma.emailConfig.findFirst({
        where: { isActive: true },
        select: { smtpFrom: true, smtpUser: true },
      });
    }
    
    if (dbConfig) {
      return dbConfig.smtpFrom || dbConfig.smtpUser;
    }
    
    return this.config.get('SMTP_USER') || 'dpo@servientrega.com.ec';
  }

  async sendPasswordReset(email: string, token: string, companyId?: string) {
    const transporter = await this.getTransporter(companyId);
    if (!transporter) {
      this.logger.warn(`No se envió correo de recuperación a ${email} porque SMTP no está configurado.`);
      return;
    }

    const frontendUrl = this.config.get('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL no está configurada');
    }

    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const from = await this.getFromAddress(companyId);

    await transporter.sendMail({
      from: `"RAT Servientrega" <${from}>`,
      to: email,
      subject: 'Recuperación de contraseña - RAT Servientrega',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C41E3A; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">🔐 Recuperación de contraseña</h2>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña del sistema <strong>RAT - Servientrega</strong>.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="background: #C41E3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Restablecer contraseña
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">O copia y pega este enlace en tu navegador:</p>
            <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="margin-top: 20px;"><strong>Nota:</strong> Este enlace expira en 1 hora por seguridad.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center;">Este correo fue enviado automáticamente por el sistema RAT - Servientrega.</p>
        </div>
      `,
    });

    this.logger.log(`Correo de recuperación enviado a ${email}`);
  }

  async sendMail(to: string, subject: string, html: string, companyId?: string) {
    const transporter = await this.getTransporter(companyId);
    if (!transporter) {
      this.logger.warn(`No se envió correo a ${to} porque SMTP no está configurado.`);
      return;
    }

    const from = await this.getFromAddress(companyId);
    await transporter.sendMail({
      from: `"RAT Servientrega" <${from}>`,
      to,
      subject,
      html: `${html}<hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" /><p style="font-size: 11px; color: #888;">Este correo fue enviado automáticamente por el sistema RAT - Servientrega.</p>`,
    });
  }
}
