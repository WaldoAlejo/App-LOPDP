const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar usuario DPO E2E para obtener su companyId
  const user = await prisma.user.findUnique({
    where: { email: 'dpo@e2e.com' },
  });

  if (!user) {
    console.error('❌ Usuario dpo@e2e.com no encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName}`);
  console.log(`   CompanyId: ${user.companyId}`);

  // Obtener credenciales SMTP de variables de entorno
  const smtpPass = process.env.SMTP_PASS || process.env.E2E_SMTP_PASS;
  if (!smtpPass) {
    console.error('❌ Variable de entorno SMTP_PASS o E2E_SMTP_PASS no configurada');
    process.exit(1);
  }

  // Guardar configuración de correo para la empresa del usuario E2E
  const config = await prisma.emailConfig.upsert({
    where: { companyId: user.companyId },
    update: {
      smtpHost: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || 'dpo@servientrega.com.ec',
      smtpPass,
      smtpFrom: process.env.SMTP_FROM || 'dpo@servientrega.com.ec',
      isActive: true,
    },
    create: {
      companyId: user.companyId,
      smtpHost: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || 'dpo@servientrega.com.ec',
      smtpPass,
      smtpFrom: process.env.SMTP_FROM || 'dpo@servientrega.com.ec',
      isActive: true,
    },
  });

  console.log('');
  console.log('✅ Configuración de correo guardada:');
  console.log(`   Empresa ID: ${user.companyId}`);
  console.log(`   Servidor: ${config.smtpHost}:${config.smtpPort}`);
  console.log(`   Usuario: ${config.smtpUser}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
