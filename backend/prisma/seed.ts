import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrador' },
    { code: 'COMPANY_ADMIN', name: 'Administrador de Empresa' },
    { code: 'DPO', name: 'Delegado de Protección de Datos' },
    { code: 'LEGAL_REVIEWER', name: 'Revisor Jurídico' },
    { code: 'PROCESS_LEADER', name: 'Líder de Proceso' },
    { code: 'SUPPORT', name: 'Colaborador de Apoyo' },
    { code: 'AUDITOR', name: 'Auditor' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  if (superAdminRole) {
    const existing = await prisma.user.findUnique({
      where: { email: 'superadmin@servientrega-rat.com' },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash('SuperAdmin123!', 10);
      await prisma.user.create({
        data: {
          firstName: 'Super',
          lastName: 'Administrador',
          email: 'superadmin@servientrega-rat.com',
          passwordHash,
          roleId: superAdminRole.id,
          isActive: true,
        },
      });
      console.log('Usuario superadmin creado.');
    }
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
