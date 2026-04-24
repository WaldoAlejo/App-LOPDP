const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: { select: { code: true, name: true } },
      isActive: true,
      companyId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📋 Usuarios en la base de datos:\n');
  for (const u of users) {
    console.log(`  ${u.email} | ${u.firstName} ${u.lastName} | ${u.role?.code} | ${u.isActive ? '✅ Activo' : '❌ Inactivo'}`);
  }
  console.log(`\nTotal: ${users.length} usuarios\n`);

  await prisma.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
