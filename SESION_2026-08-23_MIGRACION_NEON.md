# Sesión 2026-08-23 — Migración a Neon y carga del primer RAT (Facturación)

Handoff para continuar esta tarea en una sesión nueva de Claude (u otra persona). Léelo
completo antes de tocar nada — evita repetir pasos ya hechos o romper datos ya cargados.

## Contexto: por qué estamos aquí

El objetivo del usuario (DPO de Servientrega) es empezar a cargar los RAT reales de cada
proceso (que ya tiene levantados en Excel/PDF) para construir la matriz RAT. Al intentar
cargar el primero (Facturación), se descubrió que **la infraestructura de GCP documentada
en el repo (VM `35.222.179.61` + Cloud SQL `35.188.74.90`) fue eliminada** — ya no existe.
Se decidió migrar a un Postgres gratuito en **Neon** para no depender de infraestructura
que se pueda volver a perder, y correr backend/frontend localmente contra esa base.

## Estado actual — qué ya está hecho

1. **Base de datos Neon creada y migrada.** Las 10 migraciones de Prisma se aplicaron
   correctamente. La connection string vive **solo** en `backend/.env.local` de la
   máquina donde se hizo esto (gitignored, no está en este repo). **Si estás en una
   máquina/clon nuevo, pídele al usuario que te la vuelva a pasar** y ponla en
   `backend/.env.local` (ver `backend/.env.example` para el resto de variables; genera
   `JWT_SECRET`/`JWT_REFRESH_SECRET` nuevos con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

2. **Datos base cargados en Neon** (scripts corridos en este orden — no volver a
   correr `load-servientrega-data.ts`, borra y recrea tratamientos/áreas/usuarios):
   - `prisma/seed.ts` → roles base (`SUPER_ADMIN`, `COMPANY_ADMIN`, `DPO`,
     `LEGAL_REVIEWER`, `PROCESS_LEADER`, `SUPPORT`, `AUDITOR`) + un usuario
     `SUPER_ADMIN` (`superadmin@servientrega.com.ec`, password tomado de
     `SEED_SUPERADMIN_PASSWORD` en `backend/.env` — **cámbiala**, ese valor viene de
     un archivo viejo que no debería reutilizarse).
   - `prisma/load-servientrega-data.ts` → leyó `Lista de correos - Procesos.csv` y
     creó: empresa **Servientrega Ecuador S.A.** (RUC `0990010931001`, id
     `7f511dec-fef6-4dab-89a4-aaa5e7921286`), **7 áreas/macroprocesos**, **24 procesos**,
     **63 usuarios líderes** (rol `PROCESS_LEADER`), catálogos mínimos genéricos.
     Password temporal de todos: `Servientrega2024!` (mismo patrón ya documentado en
     `MANUAL_DE_USUARIO.md`).
   - `prisma/add-dpo-security-leader.ts` → creó el usuario DPO real
     (`oswaldo.cevallos@dpo-externo.com`, rol `DPO`, externo) y el Líder de Seguridad
     (`christian.diaz@servientrega.com.ec`, rol `SECURITY_LEAD`), ambos en área
     `ALTA DIRECCIÓN` (id `b511082c-4331-41aa-a60e-8acfaacc5da8`).
   - `scripts/mark-force-password-change.ts` → los 66 usuarios quedaron marcados
     `forcePasswordChange = true` (deben cambiar su contraseña en el primer login).

3. **IDs útiles ya conocidos** (empresa Servientrega):
   - `companyId`: `7f511dec-fef6-4dab-89a4-aaa5e7921286`
   - Área **MERF**: `6228faa8-303e-4b5c-b9db-37917469404e`
   - Área **ALTA DIRECCIÓN**: `b511082c-4331-41aa-a60e-8acfaacc5da8`
   - Proceso **Facturación** (bajo MERF): `d349fe3d-9391-4062-a9c1-d7ac741fbc04`
   - Usuario **Jose Manuel Achupallas** (líder de Facturación):
     `jose.achupallas@servientrega.com.ec`, ya es `responsibleUserId` del proceso.

4. **Bug menor corregido**: `backend/src/modules/form-import/form-import.service.ts`
   no compilaba en TypeScript bajo Node 24 (`Buffer<ArrayBufferLike>` vs `Buffer` de
   `exceljs`). Se arregló con un cast (`buffer as any`) en `workbook.xlsx.load(...)`.
   **Ojo:** este módulo (`FormImportService`, un analizador de Excel con IA para
   pre-llenar el RAT) **no está registrado en `app.module.ts`** — no tiene controller
   ni module propio, es código huérfano/sin terminar. No lo necesitamos para cargar
   el RAT de Facturación a mano, pero si algún día se quiere activar esa vía de carga
   masiva, falta conectarlo.

5. **Catálogos creados por `load-servientrega-data.ts` son mínimos y genéricos** —
   probablemente falten para cargar el RAT real de Facturación (ver sección siguiente).
   Además tiene un bug: crea categorías de datos con código `FINAN`/`SENSIBLE` pero
   las busca después como `FIN`/`SENS` (no coinciden), así que los `dataItem` de
   categoría financiera y sensible (cuenta bancaria, tarjeta, biométrico, salud)
   **nunca se crearon**. No bloquea Facturación (no usa esos datos) pero es un bug
   real en ese script si se vuelve a necesitar.

## Bloqueador activo: el repo vive dentro de OneDrive

Se detectó que `C:\Users\oswal\OneDrive\Documentos\APP LOPDP\App-LOPDP` está dentro de
una carpeta sincronizada por OneDrive. Esto causaba cuelgues silenciosos (sin error, sin
output, CPU y memoria completamente planas por minutos) en `npm run build`,
`npm run start:dev` y `node dist/src/main.js` — confirmado con `OneDrive.exe` mostrando
~65 minutos de CPU acumulados y los archivos de `node_modules` con atributo
`ReparsePoint` (placeholders de OneDrive Files On-Demand).

**Decisión tomada:** en vez de pelear con esto, el usuario va a clonar el repo desde
GitHub a una ruta **fuera de OneDrive** (ej. `C:\dev\App-LOPDP`) y continuar ahí. Esta
sesión terminó con un `git push` de los cambios de código (fix de `form-import`,
`DATABASE_SETUP.md` actualizado, este documento). **Lo que NO viaja con el commit**
(por diseño, están en `.gitignore`): `backend/.env.local` con la connection string de
Neon. Hay que recrearlo en la ruta nueva — pide los valores al usuario.

## El RAT de Facturación — contenido ya revisado y aprobado por el DPO

Viene de un PDF (`Facturacion.pdf`, formulario BDO) que Jose Manuel Achupallas llenó.
Ya se mapeó completo a los 13 pasos del wizard y el DPO confirmó 4 puntos ambiguos.
**Falta cargarlo** — no se llegó a hacer el POST a `/treatments` por el bloqueo de
OneDrive. Contenido final acordado:

- **Paso 1 (Identificación):** Área MERF → Proceso Facturación → Responsable: Jose
  Manuel Achupallas (Facilitador Nacional de Facturación, tercerizado). Actividad:
  "Generación de Facturas". Descripción: el área corporativa carga datos del cliente
  natural en Siscore; el proceso recibe notificación por correo, valida en una carpeta
  virtual de Siscore (no puede corregir, solo corporativo) y genera facturas mensuales
  por servicio corporativo mediante SAP.
- **Paso 2 (Finalidad):** Generación de facturas de clientes con RUC de persona
  natural. Frecuencia diaria. Volumen ~1800 personas/año. Ámbito: varias provincias
  del Ecuador (nacional). Tiempo activo: prolongado (más de 3 años).
- **Paso 3 (Titulares):** Tipo "Cliente", ~1800 personas. Relación: el cliente contacta
  al proceso directamente ante novedades de factura (correo del proceso va en la
  notificación de la factura).
- **Paso 4 (Datos tratados):** Nombres, Apellidos, Email, Teléfono, Dirección, RUC (6
  datos). Sin categorías especiales.
- **Paso 5 (Base de legitimación):** **Principal = Obligación legal (Art. 7.2, por el
  SRI)**; **secundaria = Ejecución de medidas contractuales/precontractuales (Art.
  7.5)**. Confirmado por el DPO.
- **Paso 6 (Sistemas/tecnologías):** Siscore (captura/origen), SAP (generación de
  facturas y notas de crédito).
- **Paso 7 (Terceros/encargados):** El encargado es **SAP**, como proveedor del
  sistema de facturación y financiero (confirmado por el DPO). Propósito: "Emisión y
  generación de facturas y notas de crédito". Mismos 6 datos. Sin subencargados. Sin
  transferencia internacional. **SAP todavía no existe como `ThirdParty` en el
  catálogo — hay que crearlo antes de poder enlazarlo al tratamiento** (revisar en
  `backend/src/modules/catalogs/` o un módulo de terceros dedicado cuál es el
  endpoint correcto; no se llegó a confirmar en esta sesión).
- **Paso 8 (Transferencias internacionales):** No aplica.
- **Paso 9 (Conservación):** El formulario original decía "revisar con tecnología el
  tiempo" (no era un plazo real). **El DPO confirmó usar el plazo legal tributario de
  Ecuador: 7 años** (Código de Comercio / obligación de conservar comprobantes y
  registros contables-tributarios). No existe un `RetentionRule` de "7 años" en el
  catálogo todavía (solo hay uno de "5 años" creado por el seed genérico) — o se crea
  uno nuevo, o se usa el campo libre `activeRetentionPeriod`/`retentionCriteria` del
  DTO sin `retentionRuleId`.
- **Paso 10 (Medidas de seguridad):** Implementadas: control de acceso, backup,
  acuerdos de confidencialidad, registro de accesos/auditoría. Parciales: cifrado de
  datos, formación en protección de datos, "otras medidas" (sin especificar cuáles).
  El catálogo genérico actual (`ENCRYPT`, `ACCESS_CTRL`, `BACKUP`, `POLICY`) no cubre
  "acuerdos de confidencialidad", "formación" ni "registro de accesos" como entradas
  separadas — probablemente haga falta ampliar el catálogo de medidas de seguridad.
- **Paso 11-12 (Ciclo de vida / Riesgo preliminar):** Sin datos especiales, sin
  menores, sin biometría, sin decisiones automatizadas, sin videovigilancia, sin
  transferencia internacional, sin alto riesgo declarado, sin EIPD realizada, sin caso
  especial de la ley. (El backend recalcula flags de riesgo automáticamente vía
  `RiskAssessmentService` al evaluar/aprobar — no hace falta forzarlos a mano.)

## Próximos pasos exactos para la siguiente sesión

1. Confirmar que el repo se clonó en una ruta **fuera de OneDrive**.
2. Pedir al usuario la connection string de Neon y recrear `backend/.env.local` (no
   viene en el clon, está en `.gitignore` a propósito).
3. `cd backend && npm install` (clon nuevo no trae `node_modules`).
4. Levantar el backend: probar primero `npm run start:dev`; si por algún motivo se
   cuelga igual (no debería, ya fuera de OneDrive), usar el plan B que sí funcionó
   técnicamente aquí: `npm run build` seguido de `node dist/src/main.js` (ojo: el
   compilado queda en `dist/src/main.js`, **no** en `dist/main.js`).
5. Probar login como DPO: `POST /api/v1/auth/login` con
   `oswaldo.cevallos@dpo-externo.com` / `Servientrega2024!`. **Verificar cómo maneja
   el backend `forcePasswordChange=true` en el login** (no se alcanzó a probar en esta
   sesión) — puede que haga falta cambiar la contraseña vía API antes de poder operar
   normalmente.
6. Revisar el módulo de catálogos (`backend/src/modules/catalogs/`) para confirmar el
   endpoint correcto de `ThirdParty` y crear "SAP" ahí.
7. Revisar/ampliar catálogo de `SecurityMeasure` si hace falta (confidencialidad,
   formación, registro de accesos) y decidir si crear un `RetentionRule` de 7 años o
   usar campo libre.
8. Armar el payload de `POST /treatments` (ver `backend/src/modules/treatments/dto/create-treatment.dto.ts`
   para la forma exacta — requiere UUIDs reales de catálogo, no texto libre) con todo
   el contenido de la sección anterior, autenticado como DPO.
9. Una vez cargado, seguir con el siguiente RAT que el usuario vaya pasando (mismo
   patrón: revisar el PDF/Excel, mapear a los 13 pasos, confirmar ambigüedades con el
   DPO, verificar/crear catálogos faltantes, cargar vía API).

## Otro hallazgo de seguridad ya reportado (sin resolver)

`DATABASE_SETUP.md` tenía antes la contraseña real de la vieja base de GCP en texto
plano, versionada en git. Se limpió en esta sesión (ver commit), pero como esa
instancia ya no existe el riesgo práctico es bajo — igual vale la pena, en algún
momento, purgar ese valor del **historial** de git si el repo es o va a ser público.
