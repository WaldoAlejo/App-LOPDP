const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar usuario DPO E2E
  const user = await prisma.user.findUnique({
    where: { email: 'dpo@e2e.com' },
    include: { role: true },
  });

  if (!user) {
    console.error('❌ Usuario dpo@e2e.com no encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName} (${user.role.code})`);
  console.log(`   ID: ${user.id}`);
  console.log(`   CompanyId: ${user.companyId}`);

  // Buscar configuración de correo
  const emailConfig = await prisma.emailConfig.findUnique({
    where: { companyId: user.companyId },
  });

  if (!emailConfig) {
    console.error('❌ No hay configuración de correo para esta empresa');
    process.exit(1);
  }

  console.log(`✅ Configuración de correo encontrada:`);
  console.log(`   Servidor: ${emailConfig.smtpHost}:${emailConfig.smtpPort}`);
  console.log(`   Usuario: ${emailConfig.smtpUser}`);
  console.log(`   Activo: ${emailConfig.isActive}`);

  await prisma.disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
