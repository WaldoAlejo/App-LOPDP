import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '1791234567001' } });
  if (!company) {
    console.log('Empresa no encontrada');
    return;
  }

  const area = await prisma.area.findFirst({ where: { companyId: company.id } });
  const process = await prisma.process.findFirst({ where: { companyId: company.id } });
  const user = await prisma.user.findFirst({ where: { email: 'superadmin@servientrega-rat.com' } });

  if (!area || !process || !user) {
    console.log('Faltan datos base');
    return;
  }

  const treatment = await prisma.treatment.upsert({
    where: { id: 'seed-treatment-001' },
    update: {},
    create: {
      id: 'seed-treatment-001',
      companyId: company.id,
      areaId: area.id,
      processId: process.id,
      code: 'RAT-001',
      name: 'Gestión de envíos - clientes',
      mainPurpose: 'Gestionar el envío de paquetes y documentos',
      createdByUserId: user.id,
      currentStatus: 'borrador',
    },
  });

  await prisma.statusHistory.create({
    data: {
      treatmentId: treatment.id,
      previousStatus: '-',
      newStatus: 'borrador',
      changedByUserId: user.id,
      comment: 'Tratamiento de prueba creado',
    },
  });

  console.log('Tratamiento de prueba creado:', treatment.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
