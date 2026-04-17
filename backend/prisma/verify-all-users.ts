import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '0990010931001' } });
  if (!company) {
    console.log('Empresa no encontrada');
    return;
  }

  console.log('Empresa:', company.legalName);
  console.log('');

  // Contar usuarios por rol
  const usersByRole = await prisma.user.groupBy({
    by: ['roleId'],
    where: { companyId: company.id },
    _count: { id: true },
  });

  console.log('Usuarios por rol:');
  for (const group of usersByRole) {
    const role = await prisma.role.findUnique({ where: { id: group.roleId } });
    console.log(`  ${role?.code}: ${group._count.id} usuarios`);
  }

  // Listar usuarios especiales
  console.log('\nUsuarios especiales (DPO, SECURITY_LEAD):');
  const specialUsers = await prisma.user.findMany({
    where: {
      companyId: company.id,
      role: { code: { in: ['DPO', 'SECURITY_LEAD'] } },
    },
    include: { role: true, area: true },
  });

  for (const u of specialUsers) {
    console.log(`  [${u.role.code}] ${u.firstName} ${u.lastName}`);
    console.log(`    Email: ${u.email}`);
    console.log(`    Cargo: ${u.position}`);
    console.log(`    Área:  ${u.area?.name || 'N/A'}`);
    console.log('');
  }

  const totalUsers = await prisma.user.count({ where: { companyId: company.id } });
  console.log(`Total usuarios en Servientrega: ${totalUsers}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
