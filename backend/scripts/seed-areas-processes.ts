import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '1791234567001' } });
  if (!company) {
    console.log('Empresa no encontrada');
    return;
  }

  const areaNames = [
    'Talento Humano', 'Operaciones', 'Logística', 'Seguridad Física',
    'Tecnología', 'Jurídico', 'Comercial', 'Servicio al Cliente',
    'Marketing', 'Finanzas', 'Compras', 'Aduanas', 'Cumplimiento', 'DPO'
  ];

  const areas: Record<string, string> = {};
  for (const name of areaNames) {
    const area = await prisma.area.upsert({
      where: { id: `${company.id}-${name.replace(/\s+/g, '_').toUpperCase()}` },
      update: {},
      create: {
        id: `${company.id}-${name.replace(/\s+/g, '_').toUpperCase()}`,
        companyId: company.id,
        name,
        isActive: true,
      },
    });
    areas[name] = area.id;
  }

  const processes = [
    { name: 'gestión de envíos', area: 'Operaciones' },
    { name: 'entrega y distribución', area: 'Logística' },
    { name: 'atención al cliente', area: 'Servicio al Cliente' },
    { name: 'contratación de personal', area: 'Talento Humano' },
    { name: 'videovigilancia', area: 'Seguridad Física' },
    { name: 'facturación', area: 'Finanzas' },
    { name: 'marketing', area: 'Marketing' },
    { name: 'web y app', area: 'Tecnología' },
    { name: 'requerimientos de autoridad', area: 'Jurídico' },
  ];

  for (const p of processes) {
    await prisma.process.upsert({
      where: { id: `${company.id}-${p.name.replace(/\s+/g, '_').toUpperCase()}` },
      update: {},
      create: {
        id: `${company.id}-${p.name.replace(/\s+/g, '_').toUpperCase()}`,
        companyId: company.id,
        areaId: areas[p.area],
        name: p.name,
        isActive: true,
      },
    });
  }

  console.log('Áreas y procesos creados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
