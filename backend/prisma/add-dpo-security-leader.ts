import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Servientrega2024!', 10);

  // Buscar empresa Servientrega
  const company = await prisma.company.findFirst({
    where: { ruc: '0990010931001' },
  });

  if (!company) {
    console.error('❌ Empresa Servientrega no encontrada');
    return;
  }

  console.log('🏢 Empresa:', company.legalName);

  // Buscar área ALTA DIRECCIÓN
  const altaDireccion = await prisma.area.findFirst({
    where: { companyId: company.id, name: 'ALTA DIRECCIÓN' },
  });

  if (!altaDireccion) {
    console.error('❌ Área ALTA DIRECCIÓN no encontrada');
    return;
  }

  // Obtener o crear roles DPO y SECURITY_LEAD
  let dpoRole = await prisma.role.findUnique({ where: { code: 'DPO' } });
  if (!dpoRole) {
    dpoRole = await prisma.role.create({
      data: { code: 'DPO', name: 'Delegado de Protección de Datos' },
    });
    console.log('✅ Rol DPO creado');
  }

  let securityRole = await prisma.role.findUnique({ where: { code: 'SECURITY_LEAD' } });
  if (!securityRole) {
    securityRole = await prisma.role.create({
      data: { code: 'SECURITY_LEAD', name: 'Líder de Seguridad de la Información' },
    });
    console.log('✅ Rol SECURITY_LEAD creado');
  }

  // 1. Crear DPO - Oswaldo Alejandro Cevallos Campaña (Externo)
  console.log('\n👤 Creando DPO (Externo)...');
  const dpo = await prisma.user.upsert({
    where: { email: 'oswaldo.cevallos@dpo-externo.com' },
    update: {
      firstName: 'Oswaldo Alejandro',
      lastName: 'Cevallos Campaña',
      position: 'Delegado de Protección de Datos (DPO) - Externo',
      roleId: dpoRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      isActive: true,
    },
    create: {
      email: 'oswaldo.cevallos@dpo-externo.com',
      firstName: 'Oswaldo Alejandro',
      lastName: 'Cevallos Campaña',
      passwordHash,
      roleId: dpoRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      position: 'Delegado de Protección de Datos (DPO) - Externo',
      isActive: true,
    },
  });
  console.log(`✅ DPO creado: ${dpo.firstName} ${dpo.lastName} (${dpo.email})`);

  // 2. Crear Líder de Seguridad de la Información - Christian Marcel Diaz Cabrera
  console.log('\n🔒 Creando Líder de Seguridad de la Información...');
  const securityLead = await prisma.user.upsert({
    where: { email: 'christian.diaz@servientrega.com.ec' },
    update: {
      firstName: 'Christian Marcel',
      lastName: 'Diaz Cabrera',
      position: 'Facilitador Nacional de Seguridad de la Información',
      roleId: securityRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      isActive: true,
    },
    create: {
      email: 'christian.diaz@servientrega.com.ec',
      firstName: 'Christian Marcel',
      lastName: 'Diaz Cabrera',
      passwordHash,
      roleId: securityRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      position: 'Facilitador Nacional de Seguridad de la Información',
      isActive: true,
    },
  });
  console.log(`✅ Líder de Seguridad creado: ${securityLead.firstName} ${securityLead.lastName} (${securityLead.email})`);

  // Actualizar la empresa con el DPO asignado
  await prisma.company.update({
    where: { id: company.id },
    data: {
      // No hay campo dpoId en Company, pero podemos documentarlo en el tratamiento
    },
  });

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ DPO Y LÍDER DE SEGURIDAD AGREGADOS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`DPO (Externo):`);
  console.log(`  Nombre: Oswaldo Alejandro Cevallos Campaña`);
  console.log(`  Email:  oswaldo.cevallos@dpo-externo.com`);
  console.log(`  Rol:    Delegado de Protección de Datos (Externo)`);
  console.log(`  Área:   ALTA DIRECCIÓN`);
  console.log('');
  console.log(`Líder de Seguridad de la Información:`);
  console.log(`  Nombre: Christian Marcel Diaz Cabrera`);
  console.log(`  Email:  christian.diaz@servientrega.com.ec`);
  console.log(`  Rol:    Facilitador Nacional de Seguridad de la Información`);
  console.log(`  Área:   ALTA DIRECCIÓN`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Contraseña por defecto: Servientrega2024!`);
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('\n❌ ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
