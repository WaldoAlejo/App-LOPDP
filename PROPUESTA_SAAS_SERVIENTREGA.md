# PROPUESTA COMERCIAL - MODELO SaaS
## Aplicación RAT - Registro de Actividades de Tratamiento (LOPDP)
### Servientrega Ecuador

---

**Fecha:** Abril 2026
**Versión:** 2.0 - Modelo SaaS
**Elaborado por:** [Tu nombre / Empresa]

---

## ÍNDICE

1. [Modelo de Negocio SaaS](#1-modelo-de-negocio-saas)
2. [Tecnología Utilizada](#2-tecnología-utilizada)
3. [Estructura de la Aplicación](#3-estructura-de-la-aplicación)
4. [Infraestructura de Despliegue](#4-infraestructura-de-despliegue)
5. [Mantenimiento y Soporte](#5-mantenimiento-y-soporte)
6. [Mejoras y Evolutivo](#6-mejoras-y-evolutivo)
7. [Propuesta Comercial](#7-propuesta-comercial)
8. [Seguridad y Confidencialidad](#8-seguridad-y-confidencialidad)

---

## 1. MODELO DE NEGOCIO SaaS

### 1.1 ¿Qué es el modelo SaaS?

**Software as a Service (SaaS)** significa que Servientrega accede a la aplicación como un servicio, sin necesidad de adquirir el código fuente ni gestionar la infraestructura técnica.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MODELO SaaS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐         ┌─────────────────┐         ┌─────────────┐ │
│   │ SERVIENTREGA │◄───────►│   APLICACIÓN    │◄───────►│   DESARROL- │ │
│   │   (Cliente)  │  Usa    │      RAT        │  Admin  │   LADOR     │ │
│   │              │         │   (SaaS)        │         │  (Nosotros) │ │
│   └──────────────┘         └─────────────────┘         └─────────────┘ │
│                                                                         │
│   ✅ Accede vía web browser          ✅ Mantenemos el código          │
│   ✅ No instala nada                 ✅ Gestionamos actualizaciones   │
│   ✅ Paga por uso/suscripción        ✅ Soporte técnico incluido      │
│   ✅ Datos en su nube (Azure/AWS)    ✅ Mejoras continuas             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Ventajas para Servientrega

| Aspecto | Modelo SaaS | Compra de Software Tradicional |
|---------|------------|-------------------------------|
| **Inversión inicial** | Baja | Alta ($70K-$120K) |
| **Infraestructura** | En su nube, nosotros gestionamos | Debe contratar equipo IT |
| **Actualizaciones** | Automáticas, sin costo extra | Paga por cada actualización |
| **Soporte** | Incluido en la mensualidad | Costo adicional |
| **Escalabilidad** | Inmediata | Requiere desarrollo |
| **Cumplimiento LOPDP** | Garantizado y actualizado | Riesgo de quedar obsoleto |
| **Tiempo de implementación** | Inmediato | 3-6 meses |

### 1.3 ¿Qué NO incluye el modelo SaaS?

- ❌ **No se entrega código fuente** — El código es propiedad intelectual del desarrollador
- ❌ **No hay licencia perpetua** — El acceso es por suscripción activa
- ❌ **No requiere equipo técnico interno** — Nosotros gestionamos todo

### 1.4 ¿Qué SÍ incluye?

- ✅ **Acceso 24/7** a la aplicación web
- ✅ **Mantenimiento preventivo y correctivo**
- ✅ **Actualizaciones de seguridad**
- ✅ **Soporte técnico** con tiempos de respuesta definidos
- ✅ **Backups automáticos** diarios
- ✅ **Mejoras evolutivas** según necesidad
- ✅ **Cumplimiento LOPDP** garantizado y actualizado

---

## 2. TECNOLOGÍA UTILIZADA

### 2.1 Stack Tecnológico

La aplicación ha sido desarrollada con tecnologías modernas, escalables y de código abierto:

#### **Frontend (Interfaz de Usuario)**

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 19.2.4 | Biblioteca principal para interfaces interactivas |
| **TypeScript** | 6.0.2 | Tipado estático, menos errores |
| **Vite** | 8.0.4 | Compilación ultrarrápida |
| **Tailwind CSS** | 3.4.19 | Diseño moderno y responsive |
| **TanStack Query** | 5.99.0 | Manejo eficiente de datos |
| **Recharts** | 3.8.1 | Gráficos y KPIs |

#### **Backend (Lógica de Negocio)**

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **NestJS** | 11.0.1 | Framework enterprise (usado por Adidas, Roche) |
| **Node.js** | 20 LTS | Runtime de alto rendimiento |
| **Prisma ORM** | 6.19.3 | ORM moderno y seguro |
| **PostgreSQL** | 16 | Base de datos relacional robusta |
| **Passport + JWT** | 0.7.0 | Autenticación bancaria-nivel |
| **Puppeteer** | 24.41.0 | Reportes PDF profesionales |
| **ExcelJS** | 4.4.0 | Reportes Excel con formato corporativo |
| **OpenAI API** | GPT-4o-mini | Asistente de IA integrado |

#### **DevOps**

| Tecnología | Propósito |
|-----------|-----------|
| **Docker** | Contenerización portable |
| **Nginx** | Servidor web de alto rendimiento |

### 2.2 ¿Por qué estas tecnologías?

| Criterio | Justificación |
|----------|---------------|
| **Escalabilidad** | NestJS + PostgreSQL permiten crecer con la empresa |
| **Seguridad** | JWT, bcrypt, encriptación, auditoría completa |
| **Rendimiento** | Vite es 10-20x más rápido que alternativas |
| **Código abierto** | Sin licencias propietarias costosas |
| **Comunidad activa** | Soporte garantizado por años |

---

## 3. ESTRUCTURA DE LA APLICACIÓN

### 3.1 Arquitectura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    FRONTEND     │◄───────►│     BACKEND     │◄───────►│   POSTGRESQL    │
│   (React SPA)   │   API   │   (NestJS API)  │   SQL   │   (Base Datos)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### 3.2 Módulos Principales (15+)

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | **Autenticación** | Login seguro, 8 roles, permisos granulares |
| 2 | **Empresas/Áreas/Procesos** | Organización jerárquica |
| 3 | **Catálogos Maestros** | Datos maestros personalizables |
| 4 | **RAT (Núcleo)** | Wizard de 13 pasos para registrar tratamientos |
| 5 | **Observaciones** | Flujo de revisión DPO |
| 6 | **Reportes** | Excel y PDF del RAT Maestro |
| 7 | **Dashboard/KPIs** | Métricas de cumplimiento LOPDP |
| 8 | **Auditoría** | Registro de todas las acciones |
| 9 | **Asistente IA** | Sugerencias y validación con IA |
| 10 | **Versionado** | Historial de cambios |

### 3.3 El Wizard RAT - 13 Pasos

```
Paso 1: Identificación    → Paso 2: Finalidad      → Paso 3: Titulares
Paso 4: Datos             → Paso 5: Base Legal     → Paso 6: Tecnologías
Paso 7: Terceros          → Paso 8: Transferencias → Paso 9: Retención
Paso 10: Seguridad        → Paso 11: Ciclo de Vida → Paso 12: Riesgo
Paso 13: Resumen
```

### 3.4 Flujo de Aprobación

```
BORRADOR → EDICIÓN → ENVIADO → REVISIÓN DPO → [VALIDADO / OBSERVADO / RECHAZADO]
                                              ↓
                                        OBSERVADO → CORRECCIÓN → SUBSANADO
```

---

## 4. INFRAESTRUCTURA DE DESPLIEGUE

### 4.1 Requisito: Azure o AWS de Servientrega

La aplicación se despliega **en la infraestructura cloud de Servientrega**, garantizando:
- ✅ Control total de sus datos
- ✅ Cumplimiento de políticas de seguridad internas
- ✅ Integración con sistemas existentes

### 4.2 Opciones de Despliegue

#### **Opción A: Azure (Recomendada)**

```
Azure Container Apps    → Frontend + Backend (contenedores Docker)
Azure Database for PG   → PostgreSQL administrada
Azure Key Vault         → Secretos y contraseñas
Azure Blob Storage      → Archivos y reportes
Azure Monitor           → Monitoreo 24/7
```

#### **Opción B: AWS**

```
Amazon ECS Fargate      → Frontend + Backend (contenedores Docker)
Amazon RDS PostgreSQL   → Base de datos administrada
AWS Secrets Manager     → Secretos
Amazon S3               → Archivos y reportes
CloudWatch              → Monitoreo 24/7
```

### 4.3 Seguridad en la Nube

| Medida | Implementación |
|--------|---------------|
| 🔒 Encriptación | TLS 1.3 en todo el tráfico |
| 🔒 Base de datos | Encriptación en reposo |
| 🔒 Secretos | Azure Key Vault / AWS Secrets Manager |
| 🔒 Firewall | Solo puertos necesarios |
| 🔒 Backups | Automáticos diarios, 30 días de retención |
| 🔒 WAF | Protección contra ataques web |

### 4.4 Costos de Infraestructura (pagados por Servientrega)

| Recurso | Costo Mensual Est. |
|---------|-------------------|
| Contenedores (App) | $30 - $80 |
| Base de datos PostgreSQL | $15 - $50 |
| Almacenamiento | $5 - $20 |
| Monitoreo | $5 - $15 |
| **TOTAL** | **~$55 - $165/mes** |

> Estos costos se pagan directamente a Microsoft/Azure o Amazon/AWS. No son cobrados por nosotros.

---

## 5. MANTENIMIENTO Y SOPORTE

### 5.1 Tipos de Mantenimiento

| Tipo | Descripción | Frecuencia |
|------|-------------|------------|
| **Correctivo** | Corrección de bugs | Bajo demanda |
| **Preventivo** | Actualizaciones de seguridad, parches | Mensual |
| **Evolutivo** | Nuevas funcionalidades | Bajo demanda |
| **Adaptativo** | Cambios por nuevas leyes LOPDP | Según requerimiento |

### 5.2 Actividades Mensuales Incluidas

- ✅ Monitoreo 24/7 del sistema
- ✅ Backups automáticos diarios
- ✅ Revisión de logs y alertas
- ✅ Parches de seguridad
- ✅ Actualización de dependencias
- ✅ Reporte mensual de estado

### 5.3 SLAs de Soporte

| Prioridad | Tiempo de Respuesta | Ejemplo |
|-----------|---------------------|---------|
| **Crítico** | 2 horas | Sistema caído |
| **Alto** | 4 horas | Funcionalidad afectada |
| **Medio** | 24 horas | Bug menor |
| **Bajo** | 48-72 horas | Mejora solicitada |

---

## 6. MEJORAS Y EVOLUTIVO

### 6.1 Proceso de Solicitud de Mejoras

```
1. SERVIENTREGA solicita la mejora
        ↓
2. Se analiza y se estima el esfuerzo
        ↓
3. Se aprueba el presupuesto
        ↓
4. Se desarrolla en ambiente de pruebas
        ↓
5. SERVIENTREGA valida (UAT)
        ↓
6. Se despliega a producción (sin downtime)
```

### 6.2 Tipos de Mejoras

| Tipo | Ejemplo | Inversión |
|------|---------|-----------|
| **Menor** | Nuevo campo, ajuste de reporte | $200 - $500 |
| **Media** | Nuevo reporte, integración | $500 - $1,500 |
| **Mayor** | Nuevo módulo, rediseño | $1,500 - $5,000 |

### 6.3 Metodología de Despliegue

- **CI/CD**: Integración y despliegue continuo
- **Blue-Green**: Despliegues sin detener el sistema
- **Versionado semántico**: v1.2.3

---

## 7. PROPUESTA COMERCIAL

### 7.1 Modelo de Precios SaaS

Dado que el modelo es **SaaS** (no venta de código), la inversión se estructura de la siguiente manera:

#### **Opción A: Suscripción Mensual (Recomendada)**

| Concepto | Inversión Mensual |
|----------|-------------------|
| **Licencia SaaS RAT** | **$1,500 - $2,000/mes** |
| Incluye: | |
| - Acceso a la plataforma | ✅ |
| - Mantenimiento preventivo y correctivo | ✅ |
| - Soporte técnico (SLA definido) | ✅ |
| - Backups automáticos | ✅ |
| - Actualizaciones de seguridad | ✅ |
| - Reportes mensuales de estado | ✅ |
| - Hasta 50 usuarios | ✅ |

**Inversión anual: $18,000 - $24,000**

#### **Opción B: Suscripción Anual (10% descuento)**

| Concepto | Inversión Anual |
|----------|-----------------|
| **Licencia SaaS RAT Anual** | **$16,200 - $21,600** |
| (Equivalente a $1,350 - $1,800/mes) | |

#### **Opción C: Setup Inicial + Mensualidad Reducida**

| Concepto | Inversión |
|----------|-----------|
| **Setup inicial** (configuración, capacitación, importación de datos) | **$3,000 - $5,000** (único) |
| **Mensualidad reducida** | **$1,200 - $1,600/mes** |

### 7.2 Mejoras Evolutivas (Fuera del mantenimiento)

| Tipo | Ejemplo | Inversión |
|------|---------|-----------|
| Menor | Nuevo campo, ajuste de reporte | $200 - $500 |
| Media | Nuevo reporte, integración simple | $500 - $1,500 |
| Mayor | Nuevo módulo, rediseño | $1,500 - $5,000 |

**Modelos de contratación:**
- Precio fijo por feature (después de estimación)
- Bolsa de horas prepagada (10% descuento)
- Retainer mensual evolutivo ($800 - $1,500/mes)

### 7.3 Comparativa de Modelos

| Aspecto | SaaS Mensual | SaaS Anual | Setup + Reducida |
|---------|-------------|-----------|-----------------|
| Inversión inicial | $0 | $0 | $3,000 - $5,000 |
| Mensualidad | $1,500 - $2,000 | $0 | $1,200 - $1,600 |
| Anualidad | $0 | $16,200 - $21,600 | $0 |
| **Total Año 1** | **$18,000 - $24,000** | **$16,200 - $21,600** | **$17,400 - $24,200** |
| **Total Año 2+** | **$18,000 - $24,000** | **$16,200 - $21,600** | **$14,400 - $19,200** |
| Flexibilidad | Máxima | Media | Media |

### 7.4 Comparativa: ¿Por qué SaaS vs. Desarrollo Propio?

| Opción | Inversión Año 1 | Año 2+ | Consideraciones |
|--------|----------------|--------|-----------------|
| **SaaS RAT** | $16K - $24K | $16K - $24K | Todo incluido, siempre actualizado |
| **Desarrollar desde cero** | $70K - $120K | $17K - $31K | Inversión inicial muy alta, riesgo |
| **Software genérico** | $20K - $50K | $10K - $20K | No personalizable, soporte limitado |
| **Consultoría manual** | $30K - $80K | $30K - $80K | Sin automatización, propenso a errores |
| **Multa LOPDP** | Hasta $50K | Hasta $50K | Riesgo legal y reputacional |

### 7.5 Garantías y Compromisos

| Compromiso | Detalle |
|------------|---------|
| ✅ Disponibilidad | 99.5% uptime garantizado |
| ✅ Soporte | Respuesta en máximo 4 horas (horario laboral) |
| ✅ Capacitación | Sesión inicial para administradores incluida |
| ✅ Documentación | Manual de usuario incluido |
| ✅ Escalabilidad | Preparada para crecer con Servientrega |
| ✅ Cumplimiento | Alineada con LOPDP ecuatoriana |
| ✅ Backup | Recuperación ante desastres garantizada |
| ✅ Seguridad | Auditorías de seguridad trimestrales |

---

## 8. SEGURIDAD Y CONFIDENCIALIDAD

### 8.1 Seguridad de Datos

- 🔒 **Encriptación TLS 1.3** en todo el tráfico
- 🔒 **Base de datos encriptada** en reposo
- 🔒 **Secretos en Azure Key Vault** / AWS Secrets Manager
- 🔒 **Autenticación JWT** con refresh tokens
- 🔒 **RBAC** (Control de acceso basado en roles)
- 🔒 **Auditoría completa** de todas las acciones
- 🔒 **Backups diarios** con retención de 30 días

### 8.2 Confidencialidad

- 📄 **Acuerdo de confidencialidad (NDA)** disponible
- 📄 **Política de protección de datos** alineada con LOPDP
- 📄 **No compartimos datos** con terceros
- 📄 **Derecho a exportar datos** en cualquier momento
- 📄 **Eliminación de datos** al finalizar contrato (bajo solicitud)

### 8.3 Cumplimiento LOPDP

La aplicación ha sido diseñada específicamente para cumplir con la **Ley Orgánica de Protección de Datos Personales del Ecuador**:

- ✅ Registro de Actividades de Tratamiento (RAT)
- ✅ Evaluación de Impacto en Protección de Datos (EIPD)
- ✅ Derechos de los titulares (acceso, rectificación, supresión)
- ✅ Medidas de seguridad técnicas y administrativas
- ✅ Transferencias internacionales de datos
- ✅ Conservación y eliminación de datos

---

## ANEXOS

### Anexo A: Glosario

| Término | Significado |
|---------|-------------|
| **SaaS** | Software as a Service — Software como servicio |
| **RAT** | Registro de Actividades de Tratamiento |
| **LOPDP** | Ley Orgánica de Protección de Datos Personales |
| **EIPD** | Evaluación de Impacto en Protección de Datos |
| **DPO** | Delegado de Protección de Datos |
| **RBAC** | Control de acceso basado en roles |
| **SLA** | Service Level Agreement — Acuerdo de nivel de servicio |

### Anexo B: Roles del Sistema

| Rol | Acceso Principal |
|-----|-----------------|
| **SUPER_ADMIN** | Acceso total, todas las empresas |
| **COMPANY_ADMIN** | Gestión de su empresa |
| **DPO** | Revisión, aprobación, observaciones |
| **SECURITY_LEAD** | Reportes, auditoría, seguridad |
| **AUDITOR** | Auditoría, reportes |
| **LEGAL_REVIEWER** | Revisión legal, evaluación de riesgos |
| **PROCESS_LEADER** | Crear/editar RATs de su área |
| **SUPPORT** | Soporte operativo |

---

**Documento preparado para:** Servientrega Ecuador
**Fecha de elaboración:** Abril 2026
**Contacto:** [Tu nombre / Empresa / Email / Teléfono]

---

*"Esta propuesta es confidencial y está dirigida exclusivamente a Servientrega Ecuador. Queda prohibida su reproducción total o parcial sin autorización expresa."*
