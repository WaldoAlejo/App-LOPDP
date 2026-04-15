import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({ where: { ruc: '1791234567001' } });
  if (!company) {
    console.log('No se encontró la empresa de Servientrega');
    return;
  }

  const companyId = company.id;

  // Tipos de titulares
  const dataSubjectTypes = [
    'remitente', 'destinatario', 'cliente', 'cliente corporativo',
    'trabajador', 'postulante', 'ex trabajador', 'proveedor',
    'representante de proveedor', 'visitante', 'accionista',
    'arrendatario', 'usuario web', 'usuario app', 'reclamante',
    'contacto de emergencia', 'transportista', 'tercero autorizado',
  ];
  for (const name of dataSubjectTypes) {
    await prisma.dataSubjectType.upsert({
      where: { companyId_code: { companyId, code: name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: name.replace(/\s+/g, '_').toUpperCase(), name, isActive: true },
    });
  }

  // Categorías de datos
  const dataCategories = [
    { name: 'identificación', special: false },
    { name: 'contacto', special: false },
    { name: 'ubicación', special: false },
    { name: 'laborales', special: false },
    { name: 'financieros', special: false },
    { name: 'comerciales', special: false },
    { name: 'académicos', special: false },
    { name: 'familiares', special: false },
    { name: 'imágenes', special: false },
    { name: 'biométricos', special: true },
    { name: 'salud', special: true },
    { name: 'judiciales', special: true },
    { name: 'geolocalización', special: false },
    { name: 'navegación', special: false },
    { name: 'firma', special: false },
    { name: 'datos operativos de guía', special: false },
    { name: 'historial de reclamos', special: false },
  ];
  for (const cat of dataCategories) {
    await prisma.dataCategory.upsert({
      where: { companyId_code: { companyId, code: cat.name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: cat.name.replace(/\s+/g, '_').toUpperCase(), name: cat.name, isSpecialCategory: cat.special, isActive: true },
    });
  }

  // Bases legales
  const legalBases = [
    { name: 'Consentimiento del titular', ref: 'Art. 9 LOPDP' },
    { name: 'Ejecución de contrato', ref: 'Art. 9 LOPDP' },
    { name: 'Obligación legal', ref: 'Art. 9 LOPDP' },
    { name: 'Interés vital', ref: 'Art. 9 LOPDP' },
    { name: 'Interés público', ref: 'Art. 9 LOPDP' },
    { name: 'Legítimo interés', ref: 'Art. 9 LOPDP' },
  ];
  for (const lb of legalBases) {
    await prisma.legalBasis.upsert({
      where: { companyId_code: { companyId, code: lb.name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: lb.name.replace(/\s+/g, '_').toUpperCase(), name: lb.name, legalReference: lb.ref, isActive: true },
    });
  }

  // Países
  const countries = [
    { iso: 'EC', name: 'Ecuador', region: 'América del Sur' },
    { iso: 'CO', name: 'Colombia', region: 'América del Sur' },
    { iso: 'PE', name: 'Perú', region: 'América del Sur' },
    { iso: 'US', name: 'Estados Unidos', region: 'América del Norte' },
    { iso: 'MX', name: 'México', region: 'América del Norte' },
    { iso: 'ES', name: 'España', region: 'Europa' },
    { iso: 'CL', name: 'Chile', region: 'América del Sur' },
    { iso: 'AR', name: 'Argentina', region: 'América del Sur' },
  ];
  for (const c of countries) {
    await prisma.country.upsert({
      where: { id: `${c.iso}-STATIC` },
      update: {},
      create: { id: `${c.iso}-STATIC`, isoCode: c.iso, name: c.name, region: c.region, isActive: true },
    });
  }

  // Tipos de terceros
  const thirdPartyTypes = [
    'encargado', 'destinatario independiente', 'autoridad pública',
    'proveedor cloud', 'proveedor TI', 'operador logístico aliado',
    'entidad financiera', 'aseguradora', 'proveedor de marketing',
    'call center', 'digitalización documental', 'mensajería SMS',
    'estudio jurídico', 'salud ocupacional',
  ];
  for (const name of thirdPartyTypes) {
    await prisma.thirdPartyType.upsert({
      where: { code: name.replace(/\s+/g, '_').toUpperCase() },
      update: {},
      create: { code: name.replace(/\s+/g, '_').toUpperCase(), name },
    });
  }

  // Medidas de seguridad
  const securityMeasures = [
    { name: 'Cifrado de datos en tránsito', category: 'Técnica' },
    { name: 'Cifrado de datos en reposo', category: 'Técnica' },
    { name: 'Control de acceso basado en roles', category: 'Administrativa' },
    { name: 'Política de contraseñas', category: 'Administrativa' },
    { name: 'Auditoría de accesos', category: 'Administrativa' },
    { name: 'Capacitación en protección de datos', category: 'Organizativa' },
    { name: 'Cláusulas contractuales de confidencialidad', category: 'Jurídica' },
    { name: 'Cámaras de seguridad', category: 'Física' },
    { name: 'Control de acceso biométrico', category: 'Física' },
    { name: 'Backups periódicos', category: 'Técnica' },
  ];
  for (const sm of securityMeasures) {
    await prisma.securityMeasure.upsert({
      where: { companyId_code: { companyId, code: sm.name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: sm.name.replace(/\s+/g, '_').toUpperCase(), name: sm.name, category: sm.category, isActive: true },
    });
  }

  // Fases del ciclo de vida
  const lifecyclePhases = [
    { name: 'Recolección', order: 1 },
    { name: 'Registro', order: 2 },
    { name: 'Almacenamiento', order: 3 },
    { name: 'Uso y tratamiento', order: 4 },
    { name: 'Transferencia', order: 5 },
    { name: 'Conservación', order: 6 },
    { name: 'Bloqueo', order: 7 },
    { name: 'Eliminación', order: 8 },
  ];
  for (const lp of lifecyclePhases) {
    await prisma.lifecyclePhase.upsert({
      where: { companyId_code: { companyId, code: lp.name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: lp.name.replace(/\s+/g, '_').toUpperCase(), name: lp.name, orderIndex: lp.order, isActive: true },
    });
  }

  // Riesgos
  const risks = [
    { name: 'Acceso no autorizado', category: 'Confidencialidad', severity: 'Alto' },
    { name: 'Pérdida de datos', category: 'Disponibilidad', severity: 'Alto' },
    { name: 'Alteración de datos', category: 'Integridad', severity: 'Medio' },
    { name: 'Exfiltración de información', category: 'Confidencialidad', severity: 'Alto' },
    { name: 'Incumplimiento normativo', category: 'Legal', severity: 'Alto' },
    { name: 'Reputacional', category: 'Legal', severity: 'Medio' },
  ];
  for (const r of risks) {
    await prisma.risk.upsert({
      where: { companyId_code: { companyId, code: r.name.replace(/\s+/g, '_').toUpperCase() } },
      update: {},
      create: { companyId, code: r.name.replace(/\s+/g, '_').toUpperCase(), name: r.name, category: r.category, severity: r.severity, isActive: true },
    });
  }

  console.log('Catálogos iniciales creados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
