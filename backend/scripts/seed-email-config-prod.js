const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Configurando correo en base de datos...');

  // Obtener credenciales de variables de entorno
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    console.error('❌ Variable de entorno SMTP_PASS no configurada');
    console.error('   Ejecuta: SMTP_PASS=tu-contraseña node scripts/seed-email-config-prod.js');
    process.exit(1);
  }

  // Buscar la empresa de Servientrega
  const company = await prisma.company.findFirst({
    where: { ruc: '0990010931001' },
  });

  if (!company) {
    console.error('❌ Empresa Servientrega no encontrada');
    process.exit(1);
  }

  console.log(`✅ Empresa: ${company.legalName} (${company.id})`);

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

  console.log('✅ Configuración guardada:');
  console.log(`   Servidor: ${config.smtpHost}:${config.smtpPort}`);
  console.log(`   Usuario: ${config.smtpUser}`);
  console.log(`   Activo: ${config.isActive}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
