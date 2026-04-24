const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true, firstName: true, lastName: true, role: { select: { code: true } } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
