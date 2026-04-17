import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map(r => [r.code, r.id]));

  const company = await prisma.company.upsert({
    where: { ruc: '9999999999001' },
    update: {},
    create: { legalName: 'Empresa de Prueba E2E', ruc: '9999999999001', email: 'test@e2e.com', isActive: true }
  });

  const area = await prisma.area.upsert({
    where: { id: 'e2e-area-001' },
    update: {},
    create: { id: 'e2e-area-001', companyId: company.id, name: 'Area de Prueba', isActive: true }
  });

  const process = await prisma.process.upsert({
    where: { id: 'e2e-process-001' },
    update: {},
    create: { id: 'e2e-process-001', companyId: company.id, areaId: area.id, name: 'Proceso de Prueba', isActive: true }
  });

  const users = [
    { email: 'superadmin@e2e.com', firstName: 'Super', lastName: 'Admin', roleCode: 'SUPER_ADMIN' },
    { email: 'lider@e2e.com', firstName: 'Lider', lastName: 'Proceso', roleCode: 'PROCESS_LEADER' },
    { email: 'dpo@e2e.com', firstName: 'Delegado', lastName: 'Proteccion', roleCode: 'DPO' },
    { email: 'legal@e2e.com', firstName: 'Revisor', lastName: 'Juridico', roleCode: 'LEGAL_REVIEWER' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        roleId: roleMap[u.roleCode],
        companyId: company.id,
        areaId: area.id,
        isActive: true,
      }
    });
    console.log('Usuario creado:', u.email);
  }

  await prisma.dataSubjectType.upsert({
    where: { id: 'e2e-dst-001' },
    update: {},
    create: { id: 'e2e-dst-001', companyId: company.id, code: 'CLIENTE', name: 'Cliente', isActive: true }
  });

  const dataCategory = await prisma.dataCategory.upsert({
    where: { id: 'e2e-dc-001' },
    update: {},
    create: { id: 'e2e-dc-001', companyId: company.id, code: 'IDENT', name: 'Identificacion', isActive: true }
  });

  await prisma.dataItem.upsert({
    where: { id: 'e2e-di-001' },
    update: {},
    create: { id: 'e2e-di-001', dataCategoryId: dataCategory.id, code: 'NOMBRE', name: 'Nombre completo', isActive: true }
  });

  await prisma.legalBasis.upsert({
    where: { id: 'e2e-lb-001' },
    update: {},
    create: { id: 'e2e-lb-001', companyId: company.id, code: 'CONSENT', name: 'Consentimiento del titular', isActive: true }
  });

  await prisma.securityMeasure.upsert({
    where: { id: 'e2e-sm-001' },
    update: {},
    create: { id: 'e2e-sm-001', companyId: company.id, code: 'ENCRYPT', name: 'Cifrado de datos', category: 'Tecnica', isActive: true }
  });

  await prisma.lifecyclePhase.upsert({
    where: { id: 'e2e-lp-001' },
    update: {},
    create: { id: 'e2e-lp-001', companyId: company.id, code: 'RECOLECCION', name: 'Recoleccion', orderIndex: 1, isActive: true }
  });

  await prisma.retentionRule.upsert({
    where: { id: 'e2e-rr-001' },
    update: {},
    create: { id: 'e2e-rr-001', companyId: company.id, code: '5_ANIOS', name: '5 anos', defaultTerm: '5 anos', isActive: true }
  });

  console.log('Company:', company.id);
  console.log('Area:', area.id);
  console.log('Process:', process.id);
  console.log('Setup E2E completo.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
