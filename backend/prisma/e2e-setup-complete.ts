import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  // Asegurar que todos los roles existan
  const allRoles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrador' },
    { code: 'COMPANY_ADMIN', name: 'Administrador de Empresa' },
    { code: 'DPO', name: 'Delegado de Protección de Datos' },
    { code: 'LEGAL_REVIEWER', name: 'Revisor Jurídico' },
    { code: 'PROCESS_LEADER', name: 'Líder de Proceso' },
    { code: 'SUPPORT', name: 'Colaborador de Apoyo' },
    { code: 'AUDITOR', name: 'Auditor' },
    { code: 'SECURITY_LEAD', name: 'Líder de Seguridad de la Información' },
  ];

  for (const role of allRoles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map(r => [r.code, r.id]));

  // Verificar que todos los roles existan
  for (const roleCode of allRoles.map(r => r.code)) {
    if (!roleMap[roleCode]) {
      throw new Error(`Rol ${roleCode} no encontrado después del upsert`);
    }
  }

  // Empresa de prueba
  const company = await prisma.company.upsert({
    where: { ruc: '9999999999001' },
    update: {},
    create: { legalName: 'Empresa de Prueba E2E', ruc: '9999999999001', email: 'test@e2e.com', isActive: true }
  });

  const area = await prisma.area.upsert({
    where: { id: company.id + '-area' },
    update: {},
    create: { companyId: company.id, name: 'Tecnologia', isActive: true }
  });

  const process = await prisma.process.upsert({
    where: { id: company.id + '-process' },
    update: {},
    create: { companyId: company.id, areaId: area.id, name: 'Logistica Digital', isActive: true }
  });

  // Crear usuarios para TODOS los roles
  const users = [
    { email: 'superadmin@e2e.com', firstName: 'Super', lastName: 'Admin', roleCode: 'SUPER_ADMIN' },
    { email: 'companyadmin@e2e.com', firstName: 'Company', lastName: 'Admin', roleCode: 'COMPANY_ADMIN' },
    { email: 'dpo@e2e.com', firstName: 'Delegado', lastName: 'Proteccion', roleCode: 'DPO' },
    { email: 'legal@e2e.com', firstName: 'Revisor', lastName: 'Juridico', roleCode: 'LEGAL_REVIEWER' },
    { email: 'lider@e2e.com', firstName: 'Lider', lastName: 'Proceso', roleCode: 'PROCESS_LEADER' },
    { email: 'support@e2e.com', firstName: 'Soporte', lastName: 'Tecnico', roleCode: 'SUPPORT' },
    { email: 'auditor@e2e.com', firstName: 'Auditor', lastName: 'Interno', roleCode: 'AUDITOR' },
    { email: 'security@e2e.com', firstName: 'Seguridad', lastName: 'Info', roleCode: 'SECURITY_LEAD' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        roleId: roleMap[u.roleCode],
        companyId: company.id,
        areaId: area.id,
        isActive: true,
      },
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
    console.log('Usuario creado/actualizado:', u.email, '- Rol:', u.roleCode);
  }

  // Catálogos base
  await prisma.dataSubjectType.upsert({
    where: { id: company.id + '-dst' },
    update: {},
    create: { companyId: company.id, code: 'CLIENTE', name: 'Cliente', isActive: true }
  });

  const dataCategory = await prisma.dataCategory.upsert({
    where: { id: company.id + '-dc' },
    update: {},
    create: { companyId: company.id, code: 'IDENT', name: 'Identificacion', isActive: true }
  });

  await prisma.dataItem.upsert({
    where: { id: company.id + '-di' },
    update: {},
    create: { dataCategoryId: dataCategory.id, code: 'NOMBRE', name: 'Nombre completo', isActive: true }
  });

  await prisma.legalBasis.upsert({
    where: { id: company.id + '-lb' },
    update: {},
    create: { companyId: company.id, code: 'CONSENT', name: 'Consentimiento del titular', isActive: true }
  });

  await prisma.securityMeasure.upsert({
    where: { id: company.id + '-sm' },
    update: {},
    create: { companyId: company.id, code: 'ENCRYPT', name: 'Cifrado de datos', category: 'Tecnica', isActive: true }
  });

  await prisma.lifecyclePhase.upsert({
    where: { id: company.id + '-lp' },
    update: {},
    create: { companyId: company.id, code: 'RECOLECCION', name: 'Recoleccion', orderIndex: 1, isActive: true }
  });

  await prisma.retentionRule.upsert({
    where: { id: company.id + '-rr' },
    update: {},
    create: { companyId: company.id, code: '5_ANIOS', name: '5 anos', defaultTerm: '5 anos', isActive: true }
  });

  // Crear tratamientos de prueba en diferentes estados
  const testTreatments = [
    { code: 'RAT-001', name: 'Tratamiento Borrador', status: 'borrador' },
    { code: 'RAT-002', name: 'Tratamiento Enviado', status: 'enviado' },
    { code: 'RAT-003', name: 'Tratamiento Aprobado', status: 'aprobado' },
    { code: 'RAT-004', name: 'Tratamiento Observado', status: 'observado' },
    { code: 'RAT-005', name: 'Tratamiento Alto Riesgo', status: 'enviado', highRisk: true },
  ];

  const superAdminUser = await prisma.user.findUnique({ where: { email: 'superadmin@e2e.com' } });

  for (const tt of testTreatments) {
    await prisma.treatment.upsert({
      where: { companyId_code_version: { companyId: company.id, code: tt.code, version: 1 } },
      update: {},
      create: {
        code: tt.code,
        name: tt.name,
        companyId: company.id,
        areaId: area.id,
        processId: process.id,
        currentStatus: tt.status,
        version: 1,
        mainPurpose: 'Finalidad de prueba para ' + tt.name,
        createdByUserId: superAdminUser!.id,
        highRiskFlag: tt.highRisk || false,
        requiresDpia: tt.highRisk || false,
      }
    });
  }

  console.log('\n=== SETUP E2E COMPLETO ===');
  console.log('Company:', company.id);
  console.log('Area:', area.id);
  console.log('Process:', process.id);
  console.log('\nUsuarios de prueba (contraseña: Test1234!):');
  for (const u of users) {
    console.log(`  ${u.email} → ${u.roleCode}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
