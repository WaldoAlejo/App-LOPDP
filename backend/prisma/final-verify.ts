import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '0990010931001' } });
  const users = await prisma.user.findMany({
    where: { companyId: company?.id },
    include: { role: true, area: true },
    orderBy: { role: { code: 'asc' } },
  });

  console.log('Total usuarios:', users.length);
  console.log('\nUsuarios por rol:');
  const byRole: Record<string, number> = {};
  users.forEach(u => { byRole[u.role.code] = (byRole[u.role.code] || 0) + 1; });
  Object.entries(byRole).forEach(([role, count]) => console.log('  ' + role + ':', count));

  console.log('\nUsuarios de ALTA DIRECCIÓN:');
  users.filter(u => u.area?.name === 'ALTA DIRECCIÓN').forEach(u => {
    console.log('  [' + u.role.code + '] ' + u.firstName + ' ' + u.lastName + ' | ' + u.email);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
