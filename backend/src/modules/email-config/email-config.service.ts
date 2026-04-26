import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';

export interface EmailConfigDto {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

export interface EmailConfigResponse {
  id: string;
  companyId: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  isActive: boolean;
  hasPassword: boolean;
}

@Injectable()
export class EmailConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(currentUser: CurrentUser, companyId?: string): Promise<EmailConfigResponse | null> {
    const targetCompanyId = this.resolveCompanyId(currentUser, companyId);
    
    const config = await this.prisma.emailConfig.findUnique({
      where: { companyId: targetCompanyId },
    });

    if (!config) return null;

    return {
      id: config.id,
      companyId: config.companyId,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpFrom: config.smtpFrom,
      isActive: config.isActive,
      hasPassword: !!config.smtpPass,
    };
  }

  async upsertConfig(currentUser: CurrentUser, dto: EmailConfigDto, companyId?: string): Promise<EmailConfigResponse> {
    const targetCompanyId = this.resolveCompanyId(currentUser, companyId);

    const config = await this.prisma.emailConfig.upsert({
      where: { companyId: targetCompanyId },
      update: {
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpUser: dto.smtpUser,
        smtpPass: dto.smtpPass,
        smtpFrom: dto.smtpFrom,
        isActive: true,
      },
      create: {
        companyId: targetCompanyId,
        smtpHost: dto.smtpHost,
        smtpPort: dto.smtpPort,
        smtpUser: dto.smtpUser,
        smtpPass: dto.smtpPass,
        smtpFrom: dto.smtpFrom,
      },
    });

    return {
      id: config.id,
      companyId: config.companyId,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpFrom: config.smtpFrom,
      isActive: config.isActive,
      hasPassword: !!config.smtpPass,
    };
  }

  async deleteConfig(currentUser: CurrentUser, companyId?: string): Promise<void> {
    const targetCompanyId = this.resolveCompanyId(currentUser, companyId);
    
    await this.prisma.emailConfig.deleteMany({
      where: { companyId: targetCompanyId },
    });
  }

  async testConfig(currentUser: CurrentUser, dto: EmailConfigDto, companyId?: string): Promise<{ success: boolean; message: string }> {
    const nodemailer = await import('nodemailer');
    
    try {
      const transporter = nodemailer.createTransport({
        host: dto.smtpHost,
        port: dto.smtpPort || 587,
        secure: dto.smtpPort === 465,
        requireTLS: dto.smtpPort === 587,
        auth: { user: dto.smtpUser, pass: dto.smtpPass },
      });

      await transporter.verify();
      
      // Enviar correo de prueba
      await transporter.sendMail({
        from: `"RAT Servientrega" <${dto.smtpFrom || dto.smtpUser}>`,
        to: currentUser.email,
        subject: '✅ Prueba de configuración de correo - RAT Servientrega',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">¡Configuración exitosa!</h2>
            <p>Hola <strong>${currentUser.firstName}</strong>,</p>
            <p>La configuración de correo para <strong>RAT Servientrega</strong> ha sido verificada correctamente.</p>
            <p>A partir de ahora, recibirás notificaciones automáticas sobre:</p>
            <ul>
              <li>Observaciones en tus tratamientos</li>
              <li>Cambios de estado en el flujo de aprobación</li>
              <li>Recordatorios de revisiones pendientes</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Este es un correo de prueba enviado desde el sistema RAT.</p>
          </div>
        `,
      });

      return { success: true, message: 'Correo de prueba enviado exitosamente. Revisa tu bandeja de entrada.' };
    } catch (error: any) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  async getSmtpConfig(companyId: string) {
    return this.prisma.emailConfig.findUnique({
      where: { companyId },
    });
  }

  private resolveCompanyId(currentUser: CurrentUser, companyId?: string): string {
    if (currentUser.roleCode === 'SUPER_ADMIN') {
      if (!companyId) throw new ForbiddenException('SUPER_ADMIN debe especificar companyId');
      return companyId;
    }
    if (!currentUser.companyId) {
      throw new ForbiddenException('Usuario debe tener una empresa asignada');
    }
    return currentUser.companyId;
  }
}
