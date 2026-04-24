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

  // Guardar configuración de correo para la empresa del usuario E2E
  const config = await prisma.emailConfig.upsert({
    where: { companyId: user.companyId },
    update: {
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: 587,
      smtpUser: 'dpo@servientrega.com.ec',
      smtpPass: 'Ecuador2025+*',
      smtpFrom: 'dpo@servientrega.com.ec',
      isActive: true,
    },
    create: {
      companyId: user.companyId,
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: 587,
      smtpUser: 'dpo@servientrega.com.ec',
      smtpPass: 'Ecuador2025+*',
      smtpFrom: 'dpo@servientrega.com.ec',
      isActive: true,
    },
  });

  console.log('');
  console.log('✅ Configuración de correo guardada:');
  console.log(`   Empresa ID: ${user.companyId}`);
  console.log(`   Servidor: ${config.smtpHost}:${config.smtpPort}`);
  console.log(`   Usuario: ${config.smtpUser}`);

  await prisma.disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
