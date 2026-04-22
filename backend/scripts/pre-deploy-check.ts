import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // 1. Verificar conexión a base de datos
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: 'Conexión a base de datos', status: 'pass', message: 'Conexión exitosa' });
  } catch (e: any) {
    results.push({ name: 'Conexión a base de datos', status: 'fail', message: e.message });
  }

  // 2. Verificar que no hay usuarios de prueba
  const e2eUsers = await prisma.user.count({ where: { email: { contains: '@e2e.com' } } });
  if (e2eUsers === 0) {
    results.push({ name: 'Usuarios de prueba eliminados', status: 'pass', message: 'No quedan usuarios @e2e.com' });
  } else {
    results.push({ name: 'Usuarios de prueba eliminados', status: 'fail', message: `${e2eUsers} usuarios de prueba encontrados` });
  }

  // 3. Verificar que no hay empresa de prueba
  const testCompany = await prisma.company.count({ where: { ruc: '9999999999001' } });
  if (testCompany === 0) {
    results.push({ name: 'Empresa de prueba eliminada', status: 'pass', message: 'Empresa de prueba no encontrada' });
  } else {
    results.push({ name: 'Empresa de prueba eliminada', status: 'fail', message: 'Empresa de prueba aún existe' });
  }

  // 4. Verificar Servientrega existe
  const servientrega = await prisma.company.findUnique({ where: { ruc: '0990010931001' } });
  if (servientrega) {
    results.push({ name: 'Empresa Servientrega', status: 'pass', message: `Encontrada: ${servientrega.legalName}` });
  } else {
    results.push({ name: 'Empresa Servientrega', status: 'fail', message: 'No encontrada. Ejecuta load-servientrega-data.ts' });
  }

  // 5. Verificar áreas
  const areas = await prisma.area.count({ where: { company: { ruc: '0990010931001' } } });
  if (areas > 0) {
    results.push({ name: 'Áreas de Servientrega', status: 'pass', message: `${areas} áreas encontradas` });
  } else {
    results.push({ name: 'Áreas de Servientrega', status: 'fail', message: 'No hay áreas' });
  }

  // 6. Verificar procesos
  const processes = await prisma.process.count({ where: { company: { ruc: '0990010931001' } } });
  if (processes > 0) {
    results.push({ name: 'Procesos de Servientrega', status: 'pass', message: `${processes} procesos encontrados` });
  } else {
    results.push({ name: 'Procesos de Servientrega', status: 'fail', message: 'No hay procesos' });
  }

  // 7. Verificar usuarios
  const users = await prisma.user.count({ where: { company: { ruc: '0990010931001' } } });
  if (users > 0) {
    results.push({ name: 'Usuarios de Servientrega', status: 'pass', message: `${users} usuarios encontrados` });
  } else {
    results.push({ name: 'Usuarios de Servientrega', status: 'fail', message: 'No hay usuarios' });
  }

  // 8. Verificar roles del sistema
  const requiredRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'DPO', 'LEGAL_REVIEWER', 'PROCESS_LEADER', 'SUPPORT', 'AUDITOR', 'SECURITY_LEAD'];
  const existingRoles = await prisma.role.findMany({ select: { code: true } });
  const existingRoleCodes = existingRoles.map(r => r.code);
  const missingRoles = requiredRoles.filter(r => !existingRoleCodes.includes(r));
  if (missingRoles.length === 0) {
    results.push({ name: 'Roles del sistema', status: 'pass', message: `${requiredRoles.length} roles configurados` });
  } else {
    results.push({ name: 'Roles del sistema', status: 'fail', message: `Faltan roles: ${missingRoles.join(', ')}` });
  }

  // 9. Verificar catálogos mínimos
  const catalogs = await prisma.dataSubjectType.count({ where: { company: { ruc: '0990010931001' } } });
  if (catalogs > 0) {
    results.push({ name: 'Catálogos mínimos', status: 'pass', message: `${catalogs} tipos de titular encontrados` });
  } else {
    results.push({ name: 'Catálogos mínimos', status: 'warn', message: 'No hay catálogos cargados' });
  }

  // 10. Verificar DPO asignado
  const dpo = await prisma.user.findFirst({
    where: { company: { ruc: '0990010931001' }, role: { code: 'DPO' } },
  });
  if (dpo) {
    results.push({ name: 'DPO asignado', status: 'pass', message: `${dpo.firstName} ${dpo.lastName} (${dpo.email})` });
  } else {
    results.push({ name: 'DPO asignado', status: 'warn', message: 'No hay DPO asignado' });
  }

  // 11. Verificar archivos de entorno
  const backendEnv = path.resolve(__dirname, '..', '.env');
  const frontendEnv = path.resolve(__dirname, '..', '..', 'frontend', '.env');

  if (fs.existsSync(backendEnv)) {
    results.push({ name: 'Backend .env', status: 'pass', message: 'Archivo encontrado' });
  } else {
    results.push({ name: 'Backend .env', status: 'fail', message: 'Archivo no encontrado' });
  }

  if (fs.existsSync(frontendEnv)) {
    results.push({ name: 'Frontend .env', status: 'pass', message: 'Archivo encontrado' });
  } else {
    results.push({ name: 'Frontend .env', status: 'warn', message: 'Archivo no encontrado (necesario para build)' });
  }

  return results;
}

async function main() {
  console.log('🔍 VERIFICACIÓN PRE-DESPLIEGUE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = await runChecks();

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const r of results) {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️';
    const color = r.status === 'pass' ? '\x1b[32m' : r.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(`${icon} ${color}${r.name}${reset}`);
    console.log(`   ${r.message}\n`);

    if (r.status === 'pass') passed++;
    if (r.status === 'fail') failed++;
    if (r.status === 'warn') warnings++;
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Pasaron: ${passed} | ❌ Fallaron: ${failed} | ⚠️  Advertencias: ${warnings}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n❌ HAY ERRORES QUE DEBES CORREGIR ANTES DEL DESPLIEGUE');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  HAY ADVERTENCIAS. REVISA ANTES DEL DESPLIEGUE');
    process.exit(0);
  } else {
    console.log('\n🎉 TODO LISTO PARA PRODUCCIÓN');
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error('\n❌ ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
