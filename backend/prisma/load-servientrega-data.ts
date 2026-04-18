import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CsvRow {
  macro: string;
  proceso: string;
  email: string;
  nombre: string;
  cargo: string;
}

function parseCSV(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Tomar solo las primeras 5 columnas (el resto son vacías)
    const cols = line.split(';');
    const macro = cols[0]?.trim();
    const proceso = cols[1]?.trim();
    const email = cols[2]?.trim();
    const nombre = cols[3]?.trim();
    const cargo = cols[4]?.trim();

    // Saltar filas vacías o filas de encabezado repetido
    if (!macro || !proceso || !email || macro === 'MACRO' || macro === 'MEI') continue;
    // Saltar la fila rara al final "MEI;MEI;MEI;MEI;MEI"
    if (macro === 'MEI' && proceso === 'MEI') continue;

    rows.push({ macro, proceso, email, nombre, cargo });
  }

  return rows;
}

async function cleanTestData() {
  console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA...');

  // Borrar en orden para respetar FKs
  await prisma.treatmentLifecycle.deleteMany({});
  await prisma.treatmentSecurityMeasure.deleteMany({});
  await prisma.treatmentRetention.deleteMany({});
  await prisma.internationalTransfer.deleteMany({});
  await prisma.treatmentThirdParty.deleteMany({});
  await prisma.treatmentLegalBasis.deleteMany({});
  await prisma.treatmentDataItem.deleteMany({});
  await prisma.treatmentDataSubject.deleteMany({});
  await prisma.observation.deleteMany({});
  await prisma.treatmentVersion.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  await prisma.treatment.deleteMany({});

  await prisma.user.deleteMany({ where: { email: { contains: '@e2e.com' } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@servientrega.com.ec' } } });

  await prisma.process.deleteMany({});
  await prisma.area.deleteMany({});
  await prisma.dataItem.deleteMany({});
  await prisma.dataCategory.deleteMany({});
  await prisma.dataSubjectType.deleteMany({});
  await prisma.legalBasis.deleteMany({});
  await prisma.securityMeasure.deleteMany({});
  await prisma.lifecyclePhase.deleteMany({});
  await prisma.retentionRule.deleteMany({});
  await prisma.thirdParty.deleteMany({});
  await prisma.company.deleteMany({ where: { ruc: { not: '9999999999001' } } });
  await prisma.company.deleteMany({ where: { ruc: '9999999999001' } });

  console.log('✅ Datos de prueba eliminados');
}

async function loadServientregaData() {
  const csvPath = path.resolve(__dirname, '..', '..', 'Lista de correos - Procesos.csv');
  const rows = parseCSV(csvPath);

  console.log(`\n📊 CSV parseado: ${rows.length} filas válidas`);

  // Agrupar datos
  const macros = new Set<string>();
  const procesosMap = new Map<string, string>(); // proceso -> macro
  const usuariosMap = new Map<string, { nombre: string; email: string; cargo: string; proceso: string }>();

  for (const row of rows) {
    macros.add(row.macro);
    procesosMap.set(row.proceso, row.macro);

    const key = row.email.toLowerCase();
    if (!usuariosMap.has(key)) {
      usuariosMap.set(key, {
        nombre: row.nombre,
        email: row.email,
        cargo: row.cargo,
        proceso: row.proceso,
      });
    }
  }

  console.log(`\n📈 Resumen:`);
  console.log(`   Macroprocesos únicos: ${macros.size}`);
  console.log(`   Procesos únicos: ${procesosMap.size}`);
  console.log(`   Usuarios únicos: ${usuariosMap.size}`);

  // 1. Crear empresa Servientrega
  console.log('\n🏢 Creando empresa Servientrega...');
  const company = await prisma.company.create({
    data: {
      legalName: 'Servientrega Ecuador S.A.',
      tradeName: 'Servientrega',
      ruc: '0990010931001',
      address: 'Guayaquil, Ecuador',
      email: 'info@servientrega.com.ec',
      phone: '+593-4-xxx-xxxx',
      economicActivity: 'Servicios de mensajería y logística',
      sector: 'Logística y Transporte',
      isActive: true,
    },
  });
  console.log(`✅ Empresa creada: ${company.legalName} (${company.id})`);

  // 2. Crear áreas = macroprocesos
  console.log('\n📁 Creando áreas (macroprocesos)...');
  const areaMap = new Map<string, string>();
  for (const macro of macros) {
    const area = await prisma.area.create({
      data: {
        companyId: company.id,
        name: macro,
        description: `Macroproceso: ${macro}`,
        isActive: true,
      },
    });
    areaMap.set(macro, area.id);
    console.log(`   ✅ ${macro} → ${area.id}`);
  }

  // 3. Crear procesos
  console.log('\n⚙️ Creando procesos...');
  const processMap = new Map<string, string>();
  for (const [proceso, macro] of procesosMap) {
    const areaId = areaMap.get(macro);
    if (!areaId) {
      console.warn(`   ⚠️ Área no encontrada para macro: ${macro}`);
      continue;
    }
    const proc = await prisma.process.create({
      data: {
        companyId: company.id,
        areaId,
        name: proceso,
        description: `Proceso: ${proceso}`,
        isActive: true,
      },
    });
    processMap.set(proceso, proc.id);
    console.log(`   ✅ ${proceso} → ${proc.id}`);
  }

  // 4. Crear usuarios
  console.log('\n👤 Creando usuarios...');
  const passwordHash = await bcrypt.hash('Servientrega2024!', 10);

  // Obtener rol PROCESS_LEADER (o crear uno genérico)
  let leaderRole = await prisma.role.findUnique({ where: { code: 'PROCESS_LEADER' } });
  if (!leaderRole) {
    leaderRole = await prisma.role.create({
      data: { code: 'PROCESS_LEADER', name: 'Líder de Proceso' },
    });
  }

  const userMap = new Map<string, string>();
  let userCount = 0;
  for (const [email, data] of usuariosMap) {
    // Buscar el proceso al que pertenece
    const procesoId = processMap.get(data.proceso);
    const areaId = procesoId
      ? (await prisma.process.findUnique({ where: { id: procesoId }, select: { areaId: true } }))?.areaId
      : undefined;

    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.nombre.split(' ')[0] || data.nombre,
          lastName: data.nombre.split(' ').slice(1).join(' ') || '-',
          passwordHash,
          roleId: leaderRole.id,
          companyId: company.id,
          areaId,
          position: data.cargo,
          isActive: true,
        },
      });
      userMap.set(email, user.id);
      userCount++;
      if (userCount % 10 === 0) console.log(`   ... ${userCount} usuarios creados`);
    } catch (e: any) {
      console.warn(`   ⚠️ Error creando ${data.email}: ${e.message}`);
    }
  }
  console.log(`✅ ${userCount} usuarios creados`);

  // 5. Actualizar responsables de procesos (el primer usuario de cada proceso)
  console.log('\n🔗 Asignando responsables a procesos...');
  for (const [proceso, procesoId] of processMap) {
    const firstUser = rows.find(r => r.proceso === proceso);
    if (firstUser) {
      const userId = userMap.get(firstUser.email.toLowerCase());
      if (userId) {
        await prisma.process.update({
          where: { id: procesoId },
          data: { responsibleUserId: userId },
        });
        console.log(`   ✅ ${proceso} → ${firstUser.nombre}`);
      }
    }
  }

  // 6. Crear catálogos mínimos para que el wizard funcione
  console.log('\n📚 Creando catálogos mínimos...');

  const dataSubjectTypes = [
    { code: 'CLIENTE', name: 'Cliente' },
    { code: 'EMPLEADO', name: 'Empleado' },
    { code: 'PROVEEDOR', name: 'Proveedor' },
    { code: 'DESTINATARIO', name: 'Destinatario' },
  ];
  for (const dst of dataSubjectTypes) {
    await prisma.dataSubjectType.create({
      data: { companyId: company.id, code: dst.code, name: dst.name, isActive: true },
    });
  }

  const dataCategories = [
    { code: 'IDENT', name: 'Identificación', isSpecial: false },
    { code: 'CONTACT', name: 'Contacto', isSpecial: false },
    { code: 'FINAN', name: 'Financiero', isSpecial: false },
    { code: 'SENSIBLE', name: 'Datos Sensibles', isSpecial: true },
  ];
  for (const dc of dataCategories) {
    await prisma.dataCategory.create({
      data: { companyId: company.id, code: dc.code, name: dc.name, isSpecialCategory: dc.isSpecial, isActive: true },
    });
  }

  // DataItems
  const identCat = await prisma.dataCategory.findFirst({ where: { companyId: company.id, code: 'IDENT' } });
  if (identCat) {
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: identCat.id, code: 'NOMBRE', name: 'Nombre completo', isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: identCat.id, code: 'CEDULA', name: 'Cédula/RUC', isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: identCat.id, code: 'EMAIL', name: 'Correo electrónico', isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: identCat.id, code: 'TELEFONO', name: 'Teléfono', isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: identCat.id, code: 'DIRECCION', name: 'Dirección', isActive: true },
    });
  }

  const finCat = await prisma.dataCategory.findFirst({ where: { companyId: company.id, code: 'FIN' } });
  if (finCat) {
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: finCat.id, code: 'CUENTA_BANC', name: 'Cuenta bancaria', isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: finCat.id, code: 'TARJETA', name: 'Tarjeta de crédito/débito', isActive: true },
    });
  }

  const sensCat = await prisma.dataCategory.findFirst({ where: { companyId: company.id, code: 'SENS' } });
  if (sensCat) {
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: sensCat.id, code: 'BIOMETRICO', name: 'Datos biométricos', isSensitive: true, isActive: true },
    });
    await prisma.dataItem.create({
      data: { companyId: company.id, dataCategoryId: sensCat.id, code: 'SALUD', name: 'Datos de salud', isSensitive: true, isActive: true },
    });
  }

  const legalBases = [
    { code: 'CONSENT', name: 'Consentimiento del titular', ref: 'Art. 7.1 LOPDP' },
    { code: 'CONTRATO', name: 'Ejecución de contrato', ref: 'Art. 7.5 LOPDP' },
    { code: 'OBL_LEGAL', name: 'Obligación legal', ref: 'Art. 7.2 LOPDP' },
    { code: 'INTERES_LEG', name: 'Interés legítimo', ref: 'Art. 7.7 LOPDP' },
  ];
  for (const lb of legalBases) {
    await prisma.legalBasis.create({
      data: { companyId: company.id, code: lb.code, name: lb.name, legalReference: lb.ref, isActive: true },
    });
  }

  const securityMeasures = [
    { code: 'ENCRYPT', name: 'Cifrado de datos', category: 'Técnica' },
    { code: 'ACCESS_CTRL', name: 'Control de acceso', category: 'Técnica' },
    { code: 'BACKUP', name: 'Respaldo de información', category: 'Técnica' },
    { code: 'POLICY', name: 'Políticas de seguridad', category: 'Administrativa' },
  ];
  for (const sm of securityMeasures) {
    await prisma.securityMeasure.create({
      data: { companyId: company.id, code: sm.code, name: sm.name, category: sm.category, isActive: true },
    });
  }

  const lifecyclePhases = [
    { code: 'RECOLECCION', name: 'Recolección', order: 1 },
    { code: 'ALMACENAMIENTO', name: 'Almacenamiento', order: 2 },
    { code: 'USO', name: 'Uso', order: 3 },
    { code: 'COMPARTICION', name: 'Compartición', order: 4 },
    { code: 'ARCHIVO', name: 'Archivo', order: 5 },
    { code: 'ELIMINACION', name: 'Eliminación', order: 6 },
  ];
  for (const lp of lifecyclePhases) {
    await prisma.lifecyclePhase.create({
      data: { companyId: company.id, code: lp.code, name: lp.name, orderIndex: lp.order, isActive: true },
    });
  }

  await prisma.retentionRule.create({
    data: { companyId: company.id, code: '5_ANIOS', name: '5 años', defaultTerm: '5 años', isActive: true },
  });

  console.log('✅ Catálogos creados');

  // Crear usuarios especiales: DPO, Security Lead, Auditor
  console.log('\n👤 Creando usuarios especiales (DPO, Security Lead, Auditor)...');
  
  const dpoRole = await prisma.role.findFirst({ where: { code: 'DPO' } });
  const securityRole = await prisma.role.findFirst({ where: { code: 'SECURITY_LEAD' } });
  const auditorRole = await prisma.role.findFirst({ where: { code: 'AUDITOR' } });
  const altaDireccion = await prisma.area.findFirst({ where: { companyId: company.id, name: 'ALTA DIRECCIÓN' } });
  
  if (dpoRole && altaDireccion) {
    await prisma.user.create({
      data: {
        email: 'dpo@servientrega.com.ec',
        firstName: 'DPO',
        lastName: 'Servientrega',
        passwordHash,
        roleId: dpoRole.id,
        companyId: company.id,
        areaId: altaDireccion.id,
        position: 'Delegado de Protección de Datos',
        isActive: true,
      },
    }).catch(() => console.log('   ⚠️ DPO ya existe'));
    console.log('   ✅ DPO creado: dpo@servientrega.com.ec');
  }
  
  if (securityRole && altaDireccion) {
    await prisma.user.create({
      data: {
        email: 'christian.diaz@servientrega.com.ec',
        firstName: 'Christian',
        lastName: 'Diaz',
        passwordHash,
        roleId: securityRole.id,
        companyId: company.id,
        areaId: altaDireccion.id,
        position: 'Líder de Seguridad de la Información',
        isActive: true,
      },
    }).catch(() => console.log('   ⚠️ Security Lead ya existe'));
    console.log('   ✅ Security Lead creado: christian.diaz@servientrega.com.ec');
  }
  
  if (auditorRole && altaDireccion) {
    await prisma.user.create({
      data: {
        email: 'karen.reyes@servientrega.com.ec',
        firstName: 'Karen',
        lastName: 'Reyes',
        passwordHash,
        roleId: auditorRole.id,
        companyId: company.id,
        areaId: altaDireccion.id,
        position: 'Auditora Interna',
        isActive: true,
      },
    }).catch(() => console.log('   ⚠️ Auditor ya existe'));
    console.log('   ✅ Auditor creado: karen.reyes@servientrega.com.ec');
  }

  // Resumen final
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ CARGA DE DATOS SERVIENTREGA COMPLETADA');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Empresa: ${company.legalName}`);
  console.log(`Macroprocesos (Áreas): ${macros.size}`);
  console.log(`Procesos: ${procesosMap.size}`);
  console.log(`Usuarios: ${userCount}`);
  console.log(`Contraseña por defecto: Servientrega2024!`);
  console.log('═══════════════════════════════════════════════════════════════');
}

async function main() {
  console.log('🚀 INICIANDO CARGA DE DATOS SERVIENTREGA');
  console.log('═══════════════════════════════════════════════════════════════');

  await cleanTestData();
  await loadServientregaData();

  console.log('\n🎉 PROCESO COMPLETADO');
}

main()
  .catch((e) => {
    console.error('\n❌ ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
