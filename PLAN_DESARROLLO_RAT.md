# PLAN DE DESARROLLO - SISTEMA RAT SERVIENTREGA

## Objetivo
Este documento define el orden exacto de construcción del sistema RAT, tareas por fase y prompts específicos para usar con Kimi.

---

# FASE 1: SETUP DEL PROYECTO

## Tareas
- Crear repositorio
- Configurar frontend (React + Vite + TS)
- Configurar backend (NestJS + TS)
- Configurar PostgreSQL
- Configurar Prisma
- Configurar variables de entorno

## Prompt Kimi
"Genera la estructura base de un proyecto con React + Vite + TypeScript en frontend y NestJS + Prisma en backend, listo para conectarse a PostgreSQL."

---

# FASE 2: AUTENTICACIÓN Y USUARIOS

## Tareas
- Login
- Registro de usuarios
- Roles
- Permisos (RBAC)
- JWT + refresh tokens

## Prompt Kimi
"Genera el módulo de autenticación completo con NestJS, JWT, refresh tokens y RBAC, incluyendo roles y permisos."

---

# FASE 3: EMPRESAS, ÁREAS Y PROCESOS

## Tareas
- CRUD empresas
- CRUD áreas
- CRUD procesos
- Relación usuarios-áreas

## Prompt Kimi
"Genera módulos CRUD para empresas, áreas y procesos usando NestJS y Prisma con relaciones correctamente definidas."

---

# FASE 4: CATÁLOGOS

## Tareas
- Tipos de titulares
- Categorías de datos
- Bases legales
- Terceros
- Países
- Medidas de seguridad

## Prompt Kimi
"Genera un módulo genérico de catálogos reutilizable con CRUD dinámico por tipo de catálogo."

---

# FASE 5: TRATAMIENTOS (CORE)

## Tareas
- Crear entidad tratamiento
- CRUD tratamientos
- Estados
- Versionado

## Prompt Kimi
"Genera el módulo de tratamientos con estados, versionado y relaciones a áreas y procesos."

---

# FASE 6: WIZARD (FRONTEND)

## Tareas
- Formulario por pasos
- Validaciones
- Guardado en borrador

## Prompt Kimi
"Genera un wizard en React con pasos dinámicos para levantar un tratamiento con validación usando React Hook Form y Zod."

---

# FASE 7: REVISIÓN DPO

## Tareas
- Observaciones
- Aprobación
- Flujo de estados

## Prompt Kimi
"Genera el módulo de revisión de tratamientos con observaciones, cambios de estado y control por roles."

---

# FASE 8: RIESGO Y EIPD ✅ COMPLETADA

## Tareas realizadas
- Evaluación automática de riesgo en backend (`RiskAssessmentService`)
- Criterios ponderados: datos especiales, menores, biometría, salud, decisiones automatizadas, monitoreo sistemático, gran escala, transferencia transfronteriza, alto impacto potencial
- Flags `highRiskFlag` y `requiresDpia` actualizados automáticamente al aprobar/validar
- Dashboard de alertas en frontend (`/risks`) con KPIs de riesgo y EIPD
- Integración de indicadores de riesgo en el Dashboard principal
- Sidebar actualizado con acceso a "Riesgos / EIPD"
- Endpoints: `POST /treatments/:id/evaluate-risk` y `GET /treatments/:id/risk`

## Prompt Kimi
"Implementa lógica de evaluación de riesgo en backend que marque tratamientos como alto riesgo según reglas definidas."

---

# FASE 9: RAT MAESTRO Y REPORTES ✅ COMPLETADA

## Tareas realizadas
- Módulo `ReportsModule` en backend con `ReportsService` y `ReportsController`
- Generación de RAT Maestro en Excel con 13 hojas: Resumen, Tratamientos, Titulares, Datos tratados, Bases legales, Terceros, Transferencias internacionales, Retención, Medidas de seguridad, Ciclo de vida, Evaluación de riesgo, Observaciones DPO, Historial de estados
- Generación de RAT Maestro en PDF con formato profesional, tablas y badges de riesgo
- Instalación de `exceljs` y `puppeteer` en backend
- Página `/reports` en frontend con botones de descarga Excel/PDF
- Sidebar actualizado con acceso a "Reportes"
- Endpoints: `GET /reports/rat-master/excel` y `GET /reports/rat-master/pdf`
- **Corrección de relaciones en Prisma**: se agregaron las relaciones faltantes entre `Treatment` ↔ `Area`/`Process`, `TreatmentDataSubject` ↔ `DataSubjectType`, `TreatmentLegalBasis` ↔ `LegalBasis`, `TreatmentThirdParty` ↔ `ThirdParty`, `InternationalTransfer` ↔ `Country`, `TreatmentRetention` ↔ `RetentionRule`, `TreatmentSecurityMeasure` ↔ `SecurityMeasure`, `TreatmentLifecycle` ↔ `LifecyclePhase`, y las relaciones inversas en todos los modelos de catálogo.
- **Pruebas unitarias**: `reports.service.spec.ts` (4 tests) y `reports.controller.spec.ts` (4 tests) — todas pasan.
- **Limpieza de datos mock/hardcodeados**:
  - Eliminados scripts de seed de prueba (`seed-company.ts`, `seed-areas-processes.ts`, `seed-catalogs.ts`, `seed-treatment.ts`)
  - `prisma/seed.ts` ahora usa `SEED_SUPERADMIN_EMAIL` y `SEED_SUPERADMIN_PASSWORD` desde variables de entorno
  - `mail.service.ts` ya no tiene fallbacks a localhost; lanza error si falta configuración SMTP
  - `frontend/src/services/api.ts` ya no tiene fallback a `localhost:3001`; lanza error si falta `VITE_API_URL`
  - `auth.service.ts` reemplazó el `Map` en memoria por la tabla `RefreshToken` en PostgreSQL con migración aplicada en GCP

## Prompt Kimi
"Genera el módulo de reportes que consolide el RAT maestro y permita exportarlo a Excel y PDF."

---

# FASE 10: DASHBOARD ✅ COMPLETADA

## Tareas realizadas
- Endpoint `GET /reports/kpis` en backend con agregación eficiente de métricas
- Métricas: total, pendientes, aprobados, en revisión DPO, alto riesgo, requieren EIPD, EIPD completado, con observaciones abiertas
- Desglose por estado, desglose por nivel de riesgo, top 5 áreas, actividad reciente (30 días)
- Instalación de `recharts` en frontend
- Dashboard rediseñado con 8 KPIs y 4 gráficos:
  - Pie chart de tratamientos por estado
  - Donut chart de distribución de riesgo
  - Línea de actividad reciente
  - Barras horizontales de top áreas
- Servicio `kpi.service.ts` en frontend
- Pruebas unitarias: `reports.kpi.spec.ts` (2 tests) — todas pasan

## Prompt Kimi
"Genera dashboard para DPO y líderes con KPIs y gráficos usando React."

---

# FASE 11: AUDITORÍA

## Tareas
- Logs
- Historial de cambios

## Prompt Kimi
"Implementa un sistema de auditoría que registre todas las acciones críticas en base de datos."

---

# ESTRUCTURA DE CARPETAS

## Frontend
src/
  modules/
  components/
  pages/
  hooks/
  services/
  store/

## Backend
src/
  modules/
  common/
  config/
prisma/

---

# ORDEN DE EJECUCIÓN REAL

1. Setup
2. Auth
3. Empresas/Usuarios
4. Catálogos
5. Tratamientos
6. Wizard
7. Revisión
8. Riesgo
9. Reportes
10. Dashboard
11. Auditoría

---

# NOTA FINAL

Siempre trabajar por módulos pequeños y validar antes de avanzar.

