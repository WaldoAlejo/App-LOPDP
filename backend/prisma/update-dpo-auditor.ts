import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Servientrega2024!', 10);

  const company = await prisma.company.findFirst({ where: { ruc: '0990010931001' } });
  if (!company) {
    console.error('❌ Empresa Servientrega no encontrada');
    return;
  }

  const altaDireccion = await prisma.area.findFirst({
    where: { companyId: company.id, name: 'ALTA DIRECCIÓN' },
  });

  if (!altaDireccion) {
    console.error('❌ Área ALTA DIRECCIÓN no encontrada');
    return;
  }

  // 1. Actualizar correo del DPO
  console.log('📧 Actualizando correo del DPO...');
  const dpo = await prisma.user.findFirst({
    where: { email: 'oswaldo.cevallos@dpo-externo.com' },
  });

  if (dpo) {
    await prisma.user.update({
      where: { id: dpo.id },
      data: { email: 'dpo@servientrega.com.ec' },
    });
    console.log('✅ DPO actualizado: dpo@servientrega.com.ec');
  } else {
    // Si no existe, crearlo
    const dpoRole = await prisma.role.findUnique({ where: { code: 'DPO' } });
    if (dpoRole) {
      await prisma.user.create({
        data: {
          email: 'dpo@servientrega.com.ec',
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
      console.log('✅ DPO creado: dpo@servientrega.com.ec');
    }
  }

  // 2. Verificar/actualizar correo del Líder de Seguridad
  console.log('\n📧 Verificando Líder de Seguridad de la Información...');
  const securityLead = await prisma.user.findFirst({
    where: { email: 'christian.diaz@servientrega.com.ec' },
  });

  if (securityLead) {
    console.log('✅ Líder de Seguridad ya existe: christian.diaz@servientrega.com.ec');
  } else {
    const securityRole = await prisma.role.findUnique({ where: { code: 'SECURITY_LEAD' } });
    if (securityRole) {
      await prisma.user.create({
        data: {
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
      console.log('✅ Líder de Seguridad creado: christian.diaz@servientrega.com.ec');
    }
  }

  // 3. Crear rol AUDITOR si no existe
  let auditorRole = await prisma.role.findUnique({ where: { code: 'AUDITOR' } });
  if (!auditorRole) {
    auditorRole = await prisma.role.create({
      data: { code: 'AUDITOR', name: 'Auditor' },
    });
    console.log('\n✅ Rol AUDITOR creado');
  }

  // 4. Crear Auditora de Alta Dirección - Karen Andreina Reyes Soledispa
  console.log('\n👤 Creando Auditora de Alta Dirección...');
  const auditor = await prisma.user.upsert({
    where: { email: 'karen.reyes@servientrega.com.ec' },
    update: {
      firstName: 'Karen Andreina',
      lastName: 'Reyes Soledispa',
      position: 'Auditora de Alta Dirección',
      roleId: auditorRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      isActive: true,
    },
    create: {
      email: 'karen.reyes@servientrega.com.ec',
      firstName: 'Karen Andreina',
      lastName: 'Reyes Soledispa',
      passwordHash,
      roleId: auditorRole.id,
      companyId: company.id,
      areaId: altaDireccion.id,
      position: 'Auditora de Alta Dirección',
      isActive: true,
    },
  });
  console.log(`✅ Auditora creada: ${auditor.firstName} ${auditor.lastName} (${auditor.email})`);

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ USUARIOS DE ALTA DIRECCIÓN ACTUALIZADOS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`DPO (Externo):`);
  console.log(`  Nombre: Oswaldo Alejandro Cevallos Campaña`);
  console.log(`  Email:  dpo@servientrega.com.ec`);
  console.log(`  Rol:    Delegado de Protección de Datos (Externo)`);
  console.log(`  Área:   ALTA DIRECCIÓN`);
  console.log('');
  console.log(`Líder de Seguridad de la Información:`);
  console.log(`  Nombre: Christian Marcel Diaz Cabrera`);
  console.log(`  Email:  christian.diaz@servientrega.com.ec`);
  console.log(`  Rol:    Facilitador Nacional de Seguridad de la Información`);
  console.log(`  Área:   ALTA DIRECCIÓN`);
  console.log('');
  console.log(`Auditora de Alta Dirección:`);
  console.log(`  Nombre: Karen Andreina Reyes Soledispa`);
  console.log(`  Email:  karen.reyes@servientrega.com.ec`);
  console.log(`  Rol:    Auditor`);
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
