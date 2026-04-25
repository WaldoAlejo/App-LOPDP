const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar la empresa de Servientrega
  const company = await prisma.company.findFirst({
    where: { ruc: '0990010931001' },
  });

  if (!company) {
    console.error('❌ Empresa Servientrega no encontrada');
    process.exit(1);
  }

  console.log(`✅ Empresa encontrada: ${company.legalName} (${company.id})`);

  // Obtener credenciales de variables de entorno
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    console.error('❌ Variable de entorno SMTP_PASS no configurada');
    console.error('   Ejecuta: SMTP_PASS=tu-contraseña node scripts/save-email-config.js');
    process.exit(1);
  }

  // Guardar configuración de correo
  const config = await prisma.emailConfig.upsert({
    where: { companyId: company.id },
    update: {
      smtpHost: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || 'dpo@servientrega.com.ec',
      smtpPass,
      smtpFrom: process.env.SMTP_FROM || 'dpo@servientrega.com.ec',
      isActive: true,
    },
    create: {
      companyId: company.id,
      smtpHost: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
      smtpPort: Number(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || 'dpo@servientrega.com.ec',
      smtpPass,
      smtpFrom: process.env.SMTP_FROM || 'dpo@servientrega.com.ec',
      isActive: true,
    },
  });

  console.log('');
  console.log('✅ Configuración de correo guardada en la base de datos:');
  console.log(`   ID: ${config.id}`);
  console.log(`   Empresa: ${company.legalName}`);
  console.log(`   Servidor: ${config.smtpHost}:${config.smtpPort}`);
  console.log(`   Usuario: ${config.smtpUser}`);
  console.log(`   Remitente: ${config.smtpFrom}`);
  console.log(`   Activo: ${config.isActive}`);
  console.log('');
  console.log('🚀 Las notificaciones automáticas están configuradas y listas para usar!');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
