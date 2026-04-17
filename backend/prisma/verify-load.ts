import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '0990010931001' } });
  console.log('Empresa:', company?.legalName);

  const areas = await prisma.area.findMany({ where: { companyId: company?.id } });
  console.log('\nÁreas (Macroprocesos):', areas.length);
  areas.forEach(a => console.log('  -', a.name));

  const processes = await prisma.process.findMany({ where: { companyId: company?.id }, include: { area: true } });
  console.log('\nProcesos:', processes.length);
  processes.forEach(p => console.log('  -', p.area.name, '→', p.name));

  const users = await prisma.user.findMany({ where: { companyId: company?.id }, take: 10 });
  console.log('\nPrimeros 10 usuarios:');
  users.forEach(u => console.log('  -', u.email, '|', u.firstName, u.lastName, '|', u.position));

  const totalUsers = await prisma.user.count({ where: { companyId: company?.id } });
  console.log('\nTotal usuarios:', totalUsers);

  const catalogs = await prisma.dataSubjectType.count({ where: { companyId: company?.id } });
  console.log('Tipos de titular:', catalogs);
  const dc = await prisma.dataCategory.count({ where: { companyId: company?.id } });
  console.log('Categorías de datos:', dc);
  const lb = await prisma.legalBasis.count({ where: { companyId: company?.id } });
  console.log('Bases legales:', lb);
  const sm = await prisma.securityMeasure.count({ where: { companyId: company?.id } });
  console.log('Medidas de seguridad:', sm);
  const lp = await prisma.lifecyclePhase.count({ where: { companyId: company?.id } });
  console.log('Fases ciclo de vida:', lp);
}

main().catch(console.error).finally(() => prisma.$disconnect());
