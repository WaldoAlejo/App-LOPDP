import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { ruc: '1791234567001' },
    update: {},
    create: {
      legalName: 'Servientrega Ecuador S.A.',
      tradeName: 'Servientrega',
      ruc: '1791234567001',
      email: 'info@servientrega.com.ec',
      address: 'Quito, Ecuador',
      sector: 'Logística y transporte',
      isActive: true,
    },
  });
  console.log('Empresa creada/actualizada:', company.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
