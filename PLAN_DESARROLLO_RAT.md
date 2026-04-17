# PLAN DE DESARROLLO - SISTEMA RAT SERVIENTREGA

## Objetivo
Este documento define el orden exacto de construcción del sistema RAT, tareas por fase y prompts específicos para usar con Kimi.

## Criterio rector del RAT bajo la LOPDP del Ecuador
- El RAT no es solo un formulario interno: es el instrumento de gobernanza con el que el responsable demuestra que conoce, organiza y controla sus tratamientos.
- Debe diferenciarse del RNPD: el RAT sirve para trazabilidad interna y cumplimiento operativo; el RNPD responde a una obligación de reporte ante la autoridad.
- Conforme al Reglamento General a la LOPDP, el RAT debe cubrir como minimo: identificacion del responsable/corresponsable/DPO, fines, destinatarios, titulares y categorias de datos, perfilamiento cuando aplique, transferencias internacionales, bases de legitimacion, plazos de conservacion y medidas tecnicas, juridicas, administrativas y organizativas.
- La obligacion de llevar RAT no debe leerse solo por numero de trabajadores. Tambien aplica, en la practica, cuando el tratamiento no es ocasional, implica riesgo para derechos y libertades, o involucra categorias especiales de datos.
- El flujo del sistema debe responder a responsabilidad proactiva: levantar informacion por proceso, estructurarla juridicamente, revisarla por DPO y mantenerla actualizada.

## Hallazgo critico de la implementacion actual
- El wizard ya persiste los bloques estructurados del RAT: titulares, datos tratados, bases legales, terceros, transferencias, conservacion, medidas de seguridad, ciclo de vida, riesgo y campos de gobernanza del responsable, DPO y corresponsable.
- La brecha critica remanente no es de persistencia sino de rigor normativo y trazabilidad: deben bloquearse los envios incompletos en perfilamiento, decisiones automatizadas e IA, y debe mantenerse coherencia estricta entre observaciones DPO, correccion y subsanacion.
- El backend no debe permitir que un tratamiento se marque como observado sin observaciones abiertas ni como subsanado/validado/aprobado mientras existan observaciones pendientes.
- La documentacion y el flujo operativo deben reflejar este estado real: el sistema ya cubre el contenido minimo base del RAT y ahora entra en una fase de endurecimiento juridico-operativo.

## Fases de ejecucion recomendadas

### Fase 1. Persistencia minima exigible del RAT
- Persistir desde el wizard: titulares, datos personales, bases de legitimacion, conservacion, medidas de seguridad y evaluacion preliminar de riesgo.
- Hacer consistente la validacion del frontend con la validacion real del backend.
- Objetivo: permitir que un tratamiento pueda pasar a `enviado` con informacion efectivamente almacenada.

### Fase 2. Destinatarios, terceros y transferencias
- Implementar captura y persistencia de terceros, encargados, destinatarios y transferencias internacionales.
- Exigir pais, destinatario, datos transferidos, finalidad y salvaguardas cuando aplique.

### Fase 3. Ciclo de vida, tecnologias y trazabilidad reforzada
- Integrar ciclo de vida por fases, tecnologias, soportes y documentos vinculados.
- Conectar estos bloques con auditoria, observaciones por seccion y vistas de revision DPO.

### Fase 4. Gobierno completo y salida regulatoria
- Incorporar responsable funcional, corresponsable si aplica, canal de contacto del DPO y datos de gobernanza faltantes.
- Preparar salida reutilizable para RNPD y evidencia frente a la SPDP.

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
- Explicar juridica y operativamente a que se refiere cada paso del RAT
- Diferenciar claramente datos minimos obligatorios del RAT vs datos ampliados de gobernanza

## Prompt Kimi
"Genera un wizard en React con pasos dinámicos para levantar un tratamiento con validación usando React Hook Form y Zod."

---

# FASE 6.5: PERSISTENCIA INTEGRAL DEL RAT Y CUMPLIMIENTO NORMATIVO

## Tareas
- Extender DTOs y servicios para guardar en una sola transaccion todos los bloques del RAT
- Persistir desde el wizard: titulares, datos, bases legales, terceros, transferencias, conservacion, seguridad, ciclo de vida y riesgo
- Incorporar datos del responsable funcional del tratamiento, corresponsable si aplica y referencia del DPO
- Ajustar validaciones para que el estado `enviado` solo dependa de campos realmente capturados y persistidos
- Alinear el flujo con el contenido minimo del articulo 38 del Reglamento y con escenarios reforzados por riesgo, gran escala, IA y transferencias

## Prompt Kimi
"Refactoriza el modulo RAT para persistir en NestJS + Prisma todos los pasos del wizard en una sola operacion transaccional, alineando validaciones y estructura con el contenido minimo del RAT exigido por el Reglamento General a la LOPDP del Ecuador."

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

## Prompt Kimi
"Genera el módulo de reportes que consolide el RAT maestro y permita exportarlo a Excel y PDF."

---

# FASE 10: DASHBOARD

## Tareas
- KPIs
- Gráficos
- Filtros

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
7. Persistencia integral RAT
8. Revisión
9. Riesgo
10. Reportes
11. Dashboard
12. Auditoría

---

# FLUJO RAT AJUSTADO A LOPDP ECUADOR

1. Configurar empresa, areas, procesos, catalogos y responsables.
2. Identificar cada actividad de tratamiento por proceso real, no por formulario generico.
3. Levantar el bloque minimo del RAT exigible por el Reglamento.
4. Completar bloques ampliados de gobernanza: tecnologias, ciclo de vida, riesgo, adjuntos y trazabilidad.
5. Persistir todo el tratamiento antes de habilitar envio a revision.
6. Ejecutar validaciones de completitud, riesgo y consistencia juridica.
7. Enviar a revision DPO.
8. Registrar observaciones, subsanacion, validacion y aprobacion.
9. Consolidar RAT maestro y preparar evidencia para auditoria y eventuales requerimientos de la SPDP.

---

# NOTA FINAL

Siempre trabajar por modulos pequenos y validar antes de avanzar. En este proyecto, la prioridad inmediata no es agregar mas pantallas, sino cerrar la brecha entre el wizard, la persistencia real y el contenido juridicamente exigible del RAT.

