import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
  });

  console.log('=== Roles ===');
  console.table(roles.map((r) => ({ code: r.code, name: r.name })));

  console.log('\n=== Usuarios ===');
  console.table(users.map((u) => ({ email: u.email, nombre: `${u.firstName} ${u.lastName}`, activo: u.isActive })));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
