import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanForProduction() {
  console.log('🧹 INICIANDO LIMPIEZA PARA PRODUCCIÓN...');
  console.log('═══════════════════════════════════════════════════════════════');

  // 1. Eliminar todos los tratamientos (para reiniciar contadores RAT)
  console.log('\n1. Eliminando tratamientos y datos relacionados...');
  await prisma.treatmentLifecycle.deleteMany({});
  await prisma.treatmentSecurityMeasure.deleteMany({});
  await prisma.treatmentRetention.deleteMany({});
  await prisma.internationalTransfer.deleteMany({});
  await prisma.treatmentThirdParty.deleteMany({});
  await prisma.treatmentLegalBasis.deleteMany({});
  await prisma.treatmentDataItem.deleteMany({});
  await prisma.treatmentDataSubject.deleteMany({});
  await prisma.observation.deleteMany({});
  await prisma.treatmentVersion.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  const deletedTreatments = await prisma.treatment.deleteMany({});
  console.log(`   ✅ ${deletedTreatments.count} tratamientos eliminados`);

  // 2. Eliminar usuarios de prueba (@e2e.com)
  console.log('\n2. Eliminando usuarios de prueba E2E...');
  const deletedE2EUsers = await prisma.user.deleteMany({
    where: { email: { contains: '@e2e.com' } },
  });
  console.log(`   ✅ ${deletedE2EUsers.count} usuarios E2E eliminados`);

  // 3. Eliminar empresa de prueba
  console.log('\n3. Eliminando empresa de prueba...');
  const deletedTestCompany = await prisma.company.deleteMany({
    where: { ruc: '9999999999001' },
  });
  console.log(`   ✅ ${deletedTestCompany.count} empresa de prueba eliminada`);

  // 4. Verificar que solo quede Servientrega
  console.log('\n4. Verificando datos de Servientrega...');
  const servientrega = await prisma.company.findUnique({
    where: { ruc: '0990010931001' },
    include: {
      areas: true,
      processes: true,
      users: { include: { role: true } },
      _count: {
        select: { treatments: true, areas: true, processes: true, users: true },
      },
    },
  });

  if (!servientrega) {
    console.log('   ⚠️  No se encontró la empresa Servientrega. Ejecuta primero: npx ts-node prisma/load-servientrega-data.ts');
  } else {
    console.log(`   ✅ Empresa: ${servientrega.legalName}`);
    console.log(`   ✅ Áreas: ${servientrega._count.areas}`);
    console.log(`   ✅ Procesos: ${servientrega._count.processes}`);
    console.log(`   ✅ Usuarios: ${servientrega._count.users}`);
    console.log(`   ✅ Tratamientos: ${servientrega._count.treatments}`);
  }

  // 5. Verificar que no queden datos de prueba
  console.log('\n5. Verificando que no queden datos de prueba...');
  const remainingE2E = await prisma.user.count({
    where: { email: { contains: '@e2e.com' } },
  });
  const remainingTestCompany = await prisma.company.count({
    where: { ruc: '9999999999001' },
  });

  if (remainingE2E === 0 && remainingTestCompany === 0) {
    console.log('   ✅ No quedan datos de prueba');
  } else {
    console.log(`   ⚠️  Quedan ${remainingE2E} usuarios E2E y ${remainingTestCompany} empresa de prueba`);
  }

  // 6. Listar usuarios de Servientrega
  if (servientrega) {
    console.log('\n6. Usuarios de Servientrega:');
    const roleOrder: Record<string, number> = {
      SUPER_ADMIN: 1,
      DPO: 2,
      SECURITY_LEAD: 3,
      AUDITOR: 4,
      COMPANY_ADMIN: 5,
      PROCESS_LEADER: 6,
      SUPPORT: 7,
    };
    const sortedUsers = [...servientrega.users].sort(
      (a, b) => (roleOrder[a.role.code] || 99) - (roleOrder[b.role.code] || 99)
    );
    for (const u of sortedUsers) {
      console.log(`   • ${u.email} | ${u.firstName} ${u.lastName} | ${u.role.name}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ LIMPIEZA COMPLETADA');
  console.log('═══════════════════════════════════════════════════════════════');
}

cleanForProduction()
  .catch((e) => {
    console.error('\n❌ ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
