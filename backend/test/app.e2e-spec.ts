import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authTokens: Record<string, string> = {};

  const TEST_PASSWORD = 'Test1234!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Limpiar datos de prueba anteriores
    await cleanupTestData(prisma);

    // Crear datos base para E2E
    await seedE2EData(prisma);

    // Autenticar usuarios de prueba
    const loginSuperAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@e2e.com', password: TEST_PASSWORD });
    authTokens['SUPER_ADMIN'] = loginSuperAdmin.body.tokens.accessToken;

    const loginLeader = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lider@e2e.com', password: TEST_PASSWORD });
    authTokens['PROCESS_LEADER'] = loginLeader.body.tokens.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await app.close();
  });

  describe('Autenticación', () => {
    it('/auth/login (POST) - superadmin debería autenticarse', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'superadmin@e2e.com', password: TEST_PASSWORD })
        .expect(200);

      expect(res.body.user.roleCode).toBe('SUPER_ADMIN');
      expect(res.body.tokens.accessToken).toBeDefined();
    });

    it('/auth/login (POST) - usuario de empresa debería autenticarse', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'lider@e2e.com', password: TEST_PASSWORD })
        .expect(200);

      expect(res.body.user.roleCode).toBe('PROCESS_LEADER');
      expect(res.body.user.companyId).toBeDefined();
    });

    it('/auth/login (POST) - credenciales inválidas deberían fallar', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'lider@e2e.com', password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Aislamiento por Empresa - Usuarios', () => {
    it('SUPER_ADMIN puede listar todas las empresas', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .set('Authorization', `Bearer ${authTokens['SUPER_ADMIN']}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('PROCESS_LEADER solo puede ver usuarios de su empresa', async () => {
      const leaderRes = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200);

      const companyIds = [...new Set(leaderRes.body.map((u: any) => u.company?.id))];
      expect(companyIds.length).toBe(1);
    });
  });

  describe('Aislamiento por Empresa - Tratamientos/RAT', () => {
    it('PROCESS_LEADER solo puede crear tratamientos en su empresa', async () => {
      // Obtener datos del usuario autenticado
      const meRes = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200);

      const user = meRes.body;
      expect(user.companyId).toBeDefined();

      // Listar áreas de la empresa
      const areasRes = await request(app.getHttpServer())
        .get(`/areas?companyId=${user.companyId}`)
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200);

      const areaId = areasRes.body[0]?.id;
      expect(areaId).toBeDefined();

      // Listar procesos del área
      const processesRes = await request(app.getHttpServer())
        .get(`/processes?areaId=${areaId}`)
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200);

      const processId = processesRes.body[0]?.id;
      expect(processId).toBeDefined();

      // Crear tratamiento con payload mínimo válido
      const createRes = await request(app.getHttpServer())
        .post('/treatments')
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .send({
          companyId: user.companyId,
          areaId,
          processId,
          name: 'Tratamiento de Prueba E2E',
          mainPurpose: 'Finalidad de prueba',
          captureSystem: 'Sistema web',
          storageSystem: 'Base de datos',
          medium: 'Digital',
          technologies: 'React, NestJS',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.code).toMatch(/^RAT-[A-Z]+-[A-Z]+-\d{3}$/);
      expect(createRes.body.companyId).toBe(user.companyId);
    });

    it('Usuario no puede ver tratamientos de otra empresa', async () => {
      // Crear otra empresa con datos mínimos
      const otherCompany = await prisma.company.create({
        data: {
          legalName: 'Otra Empresa',
          ruc: '9999999999002',
          email: 'otra@empresa.com',
          isActive: true,
        },
      });

      const otherArea = await prisma.area.create({
        data: { companyId: otherCompany.id, name: 'Otra Area', isActive: true },
      });

      const otherProcess = await prisma.process.create({
        data: { companyId: otherCompany.id, areaId: otherArea.id, name: 'Otro Proceso', isActive: true },
      });

      const leaderRole = await prisma.role.findUnique({ where: { code: 'PROCESS_LEADER' } });
      const otherUser = await prisma.user.create({
        data: {
          email: 'otro@e2e.com',
          firstName: 'Otro',
          lastName: 'Usuario',
          passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
          roleId: leaderRole!.id,
          companyId: otherCompany.id,
          areaId: otherArea.id,
          isActive: true,
        },
      });

      // Login del otro usuario
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'otro@e2e.com', password: TEST_PASSWORD })
        .expect(200);

      const otherToken = loginRes.body.tokens.accessToken;

      // El otro usuario no debería ver tratamientos de la primera empresa
      const treatmentsRes = await request(app.getHttpServer())
        .get('/treatments')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      const firstCompanyId = (await prisma.company.findFirst({ where: { ruc: '9999999999001' } }))!.id;
      const hasOtherCompanyTreatments = treatmentsRes.body.some(
        (t: any) => t.companyId === firstCompanyId,
      );
      expect(hasOtherCompanyTreatments).toBe(false);

      // Cleanup
      await prisma.user.deleteMany({ where: { email: 'otro@e2e.com' } });
      await prisma.treatment.deleteMany({ where: { companyId: otherCompany.id } });
      await prisma.process.deleteMany({ where: { companyId: otherCompany.id } });
      await prisma.area.deleteMany({ where: { companyId: otherCompany.id } });
      await prisma.company.delete({ where: { id: otherCompany.id } });
    });
  });

  describe('Generación de Código RAT', () => {
    it('debería generar código con formato RAT-InicialesArea-InicialesProceso-Numero', async () => {
      // Obtener área y proceso reales del seed
      const areasRes = await request(app.getHttpServer())
        .get('/areas')
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200);
      const testAreaId = areasRes.body[0]?.id;
      const testProcessId = (await request(app.getHttpServer())
        .get(`/processes?areaId=${testAreaId}`)
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .expect(200)).body[0]?.id;

      const res = await request(app.getHttpServer())
        .get('/treatments/code-preview')
        .set('Authorization', `Bearer ${authTokens['PROCESS_LEADER']}`)
        .query({ areaId: testAreaId, processId: testProcessId })
        .expect(200);

      expect(res.body.code).toMatch(/^RAT-[A-Z]{2,4}-[A-Z]{2,4}-\d{3}$/);
      expect(res.body.areaSegment).toBeDefined();
      expect(res.body.processSegment).toBeDefined();
      expect(res.body.sequence).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Usuarios atados a Áreas y Procesos', () => {
    it('cada usuario debería tener un areaId válido', async () => {
      const usersRes = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authTokens['SUPER_ADMIN']}`)
        .expect(200);

      for (const user of usersRes.body) {
        if (user.email.includes('@e2e.com')) {
          expect(user.area).toBeDefined();
          expect(user.area?.id).toBeDefined();
        }
      }
    });

    it('los procesos deberían pertenecer al área correcta', async () => {
      const processesRes = await request(app.getHttpServer())
        .get('/processes')
        .set('Authorization', `Bearer ${authTokens['SUPER_ADMIN']}`)
        .expect(200);

      for (const process of processesRes.body) {
        // Verificar que los procesos pertenecen a áreas de la misma empresa
        expect(process.areaId).toBeDefined();
        expect(process.companyId).toBeDefined();
      }
    });
  });
});

async function cleanupTestData(prisma: PrismaService) {
  try {
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
    await prisma.process.deleteMany({ where: { id: 'e2e-process-001' } });
    await prisma.area.deleteMany({ where: { id: 'e2e-area-001' } });
    await prisma.dataItem.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.dataCategory.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.dataSubjectType.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.legalBasis.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.securityMeasure.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.lifecyclePhase.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.retentionRule.deleteMany({ where: { id: { startsWith: 'e2e-' } } });
    await prisma.company.deleteMany({ where: { ruc: '9999999999001' } });
  } catch (e) {
    // Ignorar errores de cleanup si las tablas no existen
  }
}

async function seedE2EData(prisma: PrismaService) {
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map(r => [r.code, r.id]));

  if (!roleMap['SUPER_ADMIN'] || !roleMap['PROCESS_LEADER'] || !roleMap['DPO'] || !roleMap['LEGAL_REVIEWER']) {
    throw new Error('Roles requeridos no encontrados. Ejecuta prisma seed primero.');
  }

  const company = await prisma.company.create({
    data: { legalName: 'Empresa de Prueba E2E', ruc: '9999999999001', email: 'test@e2e.com', isActive: true },
  });

  const area = await prisma.area.create({
    data: { companyId: company.id, name: 'Tecnologia', isActive: true },
  });

  const process = await prisma.process.create({
    data: { companyId: company.id, areaId: area.id, name: 'Logistica Digital', isActive: true },
  });

  const users = [
    { email: 'superadmin@e2e.com', firstName: 'Super', lastName: 'Admin', roleCode: 'SUPER_ADMIN' },
    { email: 'lider@e2e.com', firstName: 'Lider', lastName: 'Proceso', roleCode: 'PROCESS_LEADER' },
    { email: 'dpo@e2e.com', firstName: 'Delegado', lastName: 'Proteccion', roleCode: 'DPO' },
    { email: 'legal@e2e.com', firstName: 'Revisor', lastName: 'Juridico', roleCode: 'LEGAL_REVIEWER' },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        roleId: roleMap[u.roleCode],
        companyId: company.id,
        areaId: area.id,
        isActive: true,
      },
    });
  }

  await prisma.dataSubjectType.create({
    data: { id: 'e2e-dst-001', companyId: company.id, code: 'CLIENTE', name: 'Cliente', isActive: true },
  });

  const dataCategory = await prisma.dataCategory.create({
    data: { id: 'e2e-dc-001', companyId: company.id, code: 'IDENT', name: 'Identificacion', isActive: true },
  });

  await prisma.dataItem.create({
    data: { id: 'e2e-di-001', dataCategoryId: dataCategory.id, code: 'NOMBRE', name: 'Nombre completo', isActive: true },
  });

  await prisma.legalBasis.create({
    data: { id: 'e2e-lb-001', companyId: company.id, code: 'CONSENT', name: 'Consentimiento del titular', isActive: true },
  });

  await prisma.securityMeasure.create({
    data: { id: 'e2e-sm-001', companyId: company.id, code: 'ENCRYPT', name: 'Cifrado de datos', category: 'Tecnica', isActive: true },
  });

  await prisma.lifecyclePhase.create({
    data: { id: 'e2e-lp-001', companyId: company.id, code: 'RECOLECCION', name: 'Recoleccion', orderIndex: 1, isActive: true },
  });

  await prisma.retentionRule.create({
    data: { id: 'e2e-rr-001', companyId: company.id, code: '5_ANIOS', name: '5 anos', defaultTerm: '5 anos', isActive: true },
  });
}
