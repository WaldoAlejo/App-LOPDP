const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Configurando correo en base de datos...');

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
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: 587,
      smtpUser: 'dpo@servientrega.com.ec',
      smtpPass: 'Ecuador2025+*',
      smtpFrom: 'dpo@servientrega.com.ec',
      isActive: true,
    },
    create: {
      companyId: company.id,
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: 587,
      smtpUser: 'dpo@servientrega.com.ec',
      smtpPass: 'Ecuador2025+*',
      smtpFrom: 'dpo@servientrega.com.ec',
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
