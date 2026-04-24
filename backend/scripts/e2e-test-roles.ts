/**
 * Script de pruebas e2e para verificar acceso por rol
 * Ejecutar: npx ts-node scripts/e2e-test-roles.ts
 */

const API_URL = 'http://localhost:3001/api';

const testUsers = [
  { email: 'superadmin@e2e.com', password: 'Test1234!', role: 'SUPER_ADMIN' },
  { email: 'companyadmin@e2e.com', password: 'Test1234!', role: 'COMPANY_ADMIN' },
  { email: 'dpo@e2e.com', password: 'Test1234!', role: 'DPO' },
  { email: 'legal@e2e.com', password: 'Test1234!', role: 'LEGAL_REVIEWER' },
  { email: 'lider@e2e.com', password: 'Test1234!', role: 'PROCESS_LEADER' },
  { email: 'support@e2e.com', password: 'Test1234!', role: 'SUPPORT' },
  { email: 'auditor@e2e.com', password: 'Test1234!', role: 'AUDITOR' },
  { email: 'security@e2e.com', password: 'Test1234!', role: 'SECURITY_LEAD' },
];

const endpoints = [
  { method: 'GET', path: '/treatments', name: 'Listar tratamientos' },
  { method: 'GET', path: '/reports/kpis', name: 'KPIs' },
  { method: 'GET', path: '/reports/rat-master/excel', name: 'Descargar Excel RAT', binary: true },
  { method: 'GET', path: '/reports/rat-master/pdf', name: 'Descargar PDF RAT', binary: true },
  { method: 'GET', path: '/audits', name: 'Auditoría' },
  { method: 'GET', path: '/users', name: 'Listar usuarios' },
  { method: 'GET', path: '/companies', name: 'Listar empresas' },
  { method: 'GET', path: '/areas', name: 'Listar áreas' },
  { method: 'GET', path: '/processes', name: 'Listar procesos' },
  { method: 'GET', path: '/catalogs/data-subject-types', name: 'Catálogo titulares' },
];

async function login(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

async function testEndpoint(token: string, endpoint: any): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(`${API_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PRUEBAS E2E - ACCESO POR ROL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const user of testUsers) {
    console.log(`\n👤 ${user.role} (${user.email})`);
    console.log('─'.repeat(60));

    const token = await login(user.email, user.password);
    if (!token) {
      console.log('  ❌ ERROR: No se pudo iniciar sesión');
      continue;
    }
    console.log('  ✅ Login exitoso');

    for (const endpoint of endpoints) {
      const result = await testEndpoint(token, endpoint);
      const icon = result.ok ? '✅' : result.status === 403 ? '🔒' : '❌';
      const statusText = result.status === 403 ? '403 Forbidden' : result.status === 200 ? '200 OK' : `${result.status}`;
      console.log(`  ${icon} ${endpoint.name.padEnd(30)} → ${statusText}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  RESUMEN DE PERMISOS ESPERADOS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`
  SUPER_ADMIN:      Todo ✅
  COMPANY_ADMIN:    Todo excepto Excel/PDF RAT 🔒
  DPO:              Todo ✅
  LEGAL_REVIEWER:   Solo KPIs, evaluar riesgo 🔒
  PROCESS_LEADER:   Tratamientos propios, KPIs 🔒
  SUPPORT:          Tratamientos propios, KPIs 🔒
  AUDITOR:          Todo excepto crear/editar usuarios/áreas ✅
  SECURITY_LEAD:    Todo excepto crear/editar usuarios/áreas ✅
  `);
}

main().catch(console.error);
