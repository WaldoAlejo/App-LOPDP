import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function describeDatabase(url?: string) {
  if (!url) {
    return 'DATABASE_URL no configurada';
  }

  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
  } catch {
    return 'DATABASE_URL inválida';
  }
}

async function main() {
  console.log('=== Validación de base de datos ===');
  console.log(`Destino: ${describeDatabase(process.env.DATABASE_URL)}`);

  const [
    companiesCount,
    usersCount,
    areasCount,
    processesCount,
    treatmentsCount,
    emailConfigsCount,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.area.count(),
    prisma.process.count(),
    prisma.treatment.count(),
    prisma.emailConfig.count(),
  ]);

  console.log('\n=== Resumen general ===');
  console.table([
    { entidad: 'companies', total: companiesCount },
    { entidad: 'users', total: usersCount },
    { entidad: 'areas', total: areasCount },
    { entidad: 'processes', total: processesCount },
    { entidad: 'treatments', total: treatmentsCount },
    { entidad: 'email_configs', total: emailConfigsCount },
  ]);

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      legalName: true,
      tradeName: true,
      isActive: true,
      _count: {
        select: {
          users: true,
          areas: true,
          processes: true,
          treatments: true,
          emailConfigs: true,
        },
      },
    },
    orderBy: { legalName: 'asc' },
  });

  console.log('\n=== Empresas ===');
  if (companies.length === 0) {
    console.log('No existen empresas registradas.');
  } else {
    console.table(
      companies.map((company) => ({
        id: company.id,
        empresa: company.tradeName || company.legalName,
        activa: company.isActive,
        usuarios: company._count.users,
        areas: company._count.areas,
        procesos: company._count.processes,
        tratamientos: company._count.treatments,
        smtpConfigs: company._count.emailConfigs,
      })),
    );
  }

  const treatmentsByStatus = await prisma.treatment.groupBy({
    by: ['currentStatus'],
    _count: { _all: true },
    orderBy: { currentStatus: 'asc' },
  });

  console.log('\n=== Tratamientos por estado ===');
  if (treatmentsByStatus.length === 0) {
    console.log('No existen tratamientos registrados.');
  } else {
    console.table(
      treatmentsByStatus.map((item) => ({
        estado: item.currentStatus,
        total: item._count._all,
      })),
    );
  }

  const recentTreatments = await prisma.treatment.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      companyId: true,
      currentStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('\n=== Últimos tratamientos ===');
  if (recentTreatments.length === 0) {
    console.log('No hay tratamientos para mostrar.');
  } else {
    console.table(
      recentTreatments.map((treatment) => ({
        id: treatment.id,
        codigo: treatment.code,
        nombre: treatment.name,
        companyId: treatment.companyId,
        estado: treatment.currentStatus,
        creado: treatment.createdAt.toISOString(),
      })),
    );
  }

  const emailConfigs = await prisma.emailConfig.findMany({
    select: {
      companyId: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpFrom: true,
      isActive: true,
    },
    orderBy: { companyId: 'asc' },
  });

  console.log('\n=== Configuración SMTP en base de datos ===');
  if (emailConfigs.length === 0) {
    console.log('No hay configuraciones SMTP guardadas en BD.');
  } else {
    console.table(emailConfigs);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });