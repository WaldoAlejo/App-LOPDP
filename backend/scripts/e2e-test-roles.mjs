/**
 * Script de pruebas e2e para verificar acceso por rol
 * Ejecutar: node scripts/e2e-test-roles.mjs
 */

const API_URL = 'http://localhost:3001/api';

const testUsers = [
  { email: 'superadmin@e2e.com', role: 'SUPER_ADMIN' },
  { email: 'companyadmin@e2e.com', role: 'COMPANY_ADMIN' },
  { email: 'dpo@e2e.com', role: 'DPO' },
  { email: 'legal@e2e.com', role: 'LEGAL_REVIEWER' },
  { email: 'lider@e2e.com', role: 'PROCESS_LEADER' },
  { email: 'support@e2e.com', role: 'SUPPORT' },
  { email: 'auditor@e2e.com', role: 'AUDITOR' },
  { email: 'security@e2e.com', role: 'SECURITY_LEAD' },
];

const endpoints = [
  { method: 'GET', path: '/treatments', name: 'Tratamientos' },
  { method: 'GET', path: '/reports/kpis', name: 'KPIs' },
  { method: 'GET', path: '/reports/rat-master/excel', name: 'Excel RAT' },
  { method: 'GET', path: '/reports/rat-master/pdf', name: 'PDF RAT' },
  { method: 'GET', path: '/audits', name: 'Auditoría' },
  { method: 'GET', path: '/users', name: 'Usuarios' },
  { method: 'GET', path: '/companies', name: 'Empresas' },
  { method: 'GET', path: '/areas', name: 'Áreas' },
  { method: 'GET', path: '/processes', name: 'Procesos' },
];

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.tokens?.accessToken;
}

async function testEndpoint(token, endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

function icon(result) {
  if (result.ok) return '✅';
  if (result.status === 403) return '🔒';
  if (result.status === 401) return '🔑';
  return '❌';
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PRUEBAS E2E - ACCESO POR ROL');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  for (const user of testUsers) {
    console.log(`\n👤 ${user.role} (${user.email})`);
    console.log('─'.repeat(65));

    const token = await login(user.email, 'Test1234!');
    if (!token) {
      console.log('  ❌ ERROR: No se pudo iniciar sesión');
      results.push({ role: user.role, login: false });
      continue;
    }
    console.log('  🔑 Login OK');

    const roleResults = { role: user.role, login: true, endpoints: {} };
    for (const ep of endpoints) {
      const result = await testEndpoint(token, ep);
      roleResults.endpoints[ep.name] = result;
      const size = result.ok && ep.name.includes('Excel') ? '(~19KB)' : ep.name.includes('PDF') ? '(~PDF)' : '';
      console.log(`  ${icon(result)} ${ep.name.padEnd(18)} → ${result.status.toString().padStart(3)} ${size}`);
    }
    results.push(roleResults);
  }

  // Tabla resumen
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  RESUMEN MATRIZ DE PERMISOS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n  Rol                Trat  KPIs  Excel PDF   Audit Users Emp   Areas Proc');
  console.log('  ──────────────────────────────────────────────────────────────────────');
  
  for (const r of results) {
    if (!r.login) {
      console.log(`  ${r.role.padEnd(18)} ❌ Login fallido`);
      continue;
    }
    const e = r.endpoints;
    const cols = [
      icon(e['Tratamientos']),
      icon(e['KPIs']),
      icon(e['Excel RAT']),
      icon(e['PDF RAT']),
      icon(e['Auditoría']),
      icon(e['Usuarios']),
      icon(e['Empresas']),
      icon(e['Áreas']),
      icon(e['Procesos']),
    ];
    console.log(`  ${r.role.padEnd(18)} ${cols.join('  ')}`);
  }

  console.log('\n  ✅ = Acceso permitido  |  🔒 = Forbidden (403)  |  ❌ = Error');
  console.log('\n═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
