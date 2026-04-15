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

  const superAdminEmail = process.env.SEED_SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SEED_SUPERADMIN_PASSWORD;

  if (superAdminEmail && superAdminPassword) {
    const superAdminRole = await prisma.role.findUnique({
      where: { code: 'SUPER_ADMIN' },
    });

    if (superAdminRole) {
      const existing = await prisma.user.findUnique({
        where: { email: superAdminEmail },
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash(superAdminPassword, 10);
        await prisma.user.create({
          data: {
            firstName: 'Super',
            lastName: 'Administrador',
            email: superAdminEmail,
            passwordHash,
            roleId: superAdminRole.id,
            isActive: true,
          },
        });
        console.log('Usuario superadmin creado.');
      }
    }
  } else {
    console.log('Variables SEED_SUPERADMIN_EMAIL y/o SEED_SUPERADMIN_PASSWORD no definidas. Saltando creación de superadmin.');
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
