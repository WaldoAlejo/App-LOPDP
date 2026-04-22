import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Marcando todos los usuarios para cambio de contraseña obligatorio...');
  
  const result = await prisma.user.updateMany({
    data: { forcePasswordChange: true },
  });
  
  console.log(`✅ ${result.count} usuarios marcados para cambio de contraseña`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
