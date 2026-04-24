# PROPUESTA TÉCNICA Y COMERCIAL
## Aplicación RAT - Registro de Actividades de Tratamiento (LOPDP)
### Servientrega Ecuador

---

**Fecha:** Abril 2026
**Versión:** 1.0
**Elaborado por:** [Tu nombre / Empresa]

---

## ÍNDICE

1. [Tecnología Utilizada](#1-tecnología-utilizada)
2. [Estructura de la Aplicación](#2-estructura-de-la-aplicación)
3. [Infraestructura de Despliegue](#3-infraestructura-de-despliegue)
4. [Mantenimiento de la Aplicación](#4-mantenimiento-de-la-aplicación)
5. [Mejoras y Despliegues](#5-mejoras-y-despliegues)
6. [Propuesta Comercial](#6-propuesta-comercial)

---

## 1. TECNOLOGÍA UTILIZADA

### 1.1 Visión General del Stack Tecnológico

La aplicación RAT (Registro de Actividades de Tratamiento) ha sido desarrollada utilizando tecnologías modernas, escalables y de código abierto, garantizando seguridad, mantenibilidad y alto rendimiento.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STACK TECNOLÓGICO RAT                           │
├─────────────────────────────┬───────────────────────────────────────────┤
│         FRONTEND            │              BACKEND                      │
│    React + Vite + TS        │         NestJS + Prisma + PostgreSQL      │
│  ┌─────────────────────┐    │    ┌─────────────────────────────────┐    │
│  │  React Router DOM   │◄──►│    │     REST API (/api/...)         │    │
│  │  TanStack Query     │    │    │  JWT Auth + Roles Guard         │    │
│  │  Zustand (Auth)     │    │    │  Prisma ORM + PostgreSQL        │    │
│  │  Recharts (KPIs)    │    │    │  Puppeteer (PDF) + ExcelJS      │    │
│  │  Tailwind CSS       │    │    │  Nodemailer (Email)             │    │
│  └─────────────────────┘    │    └─────────────────────────────────┘    │
│         Axios HTTP          │                                           │
└─────────────────────────────┴───────────────────────────────────────────┘
```

### 1.2 Detalle de Tecnologías por Capa

#### **Frontend (Interfaz de Usuario)**

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 19.2.4 | Biblioteca principal para construcción de interfaces interactivas |
| **TypeScript** | 6.0.2 | Tipado estático que previene errores en tiempo de desarrollo |
| **Vite** | 8.0.4 | Bundler ultrarrápido para desarrollo y producción |
| **Tailwind CSS** | 3.4.19 | Framework CSS utilitario para diseño responsive y consistente |
| **React Router DOM** | 7.14.1 | Enrutamiento de Single Page Application (SPA) |
| **TanStack Query** | 5.99.0 | Manejo eficiente de datos del servidor (caching, sincronización) |
| **Zustand** | 5.0.12 | Gestión de estado global ligera y performante |
| **React Hook Form** | 7.72.1 | Manejo de formularios con validación eficiente |
| **Zod** | 4.3.6 | Validación de esquemas TypeScript-first |
| **Recharts** | 3.8.1 | Gráficos y visualizaciones de KPIs |
| **Axios** | 1.15.0 | Cliente HTTP para comunicación con backend |
| **Lucide React** | 1.8.0 | Sistema de iconografía moderno |

#### **Backend (Lógica de Negocio y API)**

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **NestJS** | 11.0.1 | Framework Node.js progresivo con arquitectura modular y patrones enterprise |
| **Node.js** | 20 (LTS) | Runtime JavaScript de alto rendimiento |
| **TypeScript** | 5.7.3 | Tipado estático en todo el backend |
| **Express** | (vía NestJS) | Servidor HTTP subyacente |
| **Prisma ORM** | 6.19.3 | ORM moderno para modelado de base de datos y queries type-safe |
| **PostgreSQL** | 16 | Base de datos relacional robusta y ACID-compliant |
| **Passport + JWT** | 0.7.0 / 4.0.1 | Autenticación stateless con tokens JWT |
| **bcrypt** | 6.0.0 | Hashing seguro de contraseñas |
| **class-validator** | 0.15.1 | Validación de DTOs en endpoints |
| **Puppeteer** | 24.41.0 | Generación de reportes PDF |
| **ExcelJS** | 4.4.0 | Generación de reportes Excel |
| **Nodemailer** | 8.0.5 | Envío de correos electrónicos |
| **OpenAI API** | GPT-4o-mini | Asistente de IA para sugerencias y validación |

#### **DevOps y Contenedores**

| Tecnología | Propósito |
|-----------|-----------|
| **Docker** | Contenerización de servicios para portabilidad |
| **Docker Compose** | Orquestación de múltiples contenedores |
| **Nginx** | Servidor web/reverse proxy para frontend en producción |
| **Jest** | Framework de testing unitario e integración |
| **ESLint + Prettier** | Calidad de código y formateo consistente |

### 1.3 ¿Por qué estas tecnologías?

| Criterio | Justificación |
|----------|---------------|
| **Escalabilidad** | NestJS + PostgreSQL permiten escalar horizontalmente. React con Vite soporta aplicaciones grandes. |
| **Seguridad** | JWT stateless, bcrypt para passwords, validación en múltiples capas, CORS configurado, auditoría completa. |
| **Mantenibilidad** | TypeScript en todo el stack reduce bugs. Arquitectura modular de NestJS facilita cambios. |
| **Rendimiento** | Vite es 10-20x más rápido que webpack. PostgreSQL optimizado con índices. TanStack Query minimiza requests. |
| **Código abierto** | Todo el stack es open-source (sin licencias propietarias costosas). |
| **Comunidad activa** | React, NestJS y Prisma tienen comunidades grandes con soporte continuo. |

---

## 2. ESTRUCTURA DE LA APLICACIÓN

### 2.1 Arquitectura General

La aplicación sigue una **arquitectura monolítica modular** con separación clara entre capas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE (Navegador)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Login     │  │   Wizard    │  │  Dashboard  │  │   Reportes (PDF/    │ │
│  │   (Auth)    │  │   RAT 13    │  │   (KPIs)    │  │   Excel)            │ │
│  │             │  │   pasos     │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Nginx)                             │
│  - Single Page Application (SPA)                                             │
│  - Enrutamiento cliente con React Router                                     │
│  - Estado global con Zustand (auth)                                          │
│  - Estado servidor con TanStack Query                                        │
│  - Formularios con React Hook Form + Zod                                     │
│  - Estilos con Tailwind CSS                                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ API REST (JSON)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS + Node.js)                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  CAPA DE PRESENTACIÓN (Controllers)                                     │ │
│  │  - AuthController    - TreatmentController   - ReportController         │ │
│  │  - UserController    - CompanyController     - AuditController          │ │
│  │  - AreaController    - ProcessController     - AIAssistantController    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  CAPA DE LÓGICA DE NEGOCIO (Services)                                   │ │
│  │  - AuthService       - TreatmentService    - ReportService              │ │
│  │  - UserService       - RiskAssessmentService - AuditService             │ │
│  │  - MailService       - AIAssistantService  - VersionService             │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  CAPA DE ACCESO A DATOS (Prisma / Repositories)                         │ │
│  │  - PrismaService     - PrismaModule                                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  INFRAESTRUCTURA TRANSVERSAL                                            │ │
│  │  - Guards (JWT, Roles)  - Interceptors (Audit)  - Decorators            │ │
│  │  - Pipes (Validation)   - Filters (Exceptions)  - Middleware            │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ SQL
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BASE DE DATOS (PostgreSQL)                           │
│  - 30+ tablas relacionales                                                   │
│  - Índices optimizados                                                       │
│  - Constraints y foreign keys                                                │
│  - Multi-tenant por companyId                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Módulos Principales

#### **🔐 Módulo de Autenticación y Autorización**
- Login con email/password (bcrypt + JWT)
- Refresh tokens automáticos
- Recuperación de contraseña vía email
- Control de acceso basado en roles (RBAC)
- 8 roles definidos: SUPER_ADMIN, COMPANY_ADMIN, DPO, SECURITY_LEAD, AUDITOR, LEGAL_REVIEWER, PROCESS_LEADER, SUPPORT

#### **🏢 Módulo de Gestión Organizacional**
- Empresas (multi-tenant)
- Áreas/Departamentos
- Procesos de negocio
- Jerarquía: Empresa → Área → Proceso → Tratamiento

#### **📋 Módulo de Catálogos Maestros**
- Tipos de titulares de datos
- Categorías de datos personales
- Ítems de datos (sensibles/especiales)
- Bases legales del tratamiento
- Terceros/encargados del tratamiento
- Medidas de seguridad
- Reglas de retención
- Fases del ciclo de vida del dato
- Países (para transferencias internacionales)

#### **⭐ Módulo RAT (Núcleo de la Aplicación)**
Wizard de 13 pasos para registrar cada tratamiento:
1. **Identificación** - Código, nombre, área, proceso
2. **Finalidad** - Propósito del tratamiento
3. **Titulares** - Tipos y cantidades de personas afectadas
4. **Datos personales** - Categorías e ítems específicos
5. **Base legal** - Fundamento jurídico del tratamiento
6. **Tecnologías** - Sistemas y herramientas utilizadas
7. **Terceros** - Encargados con acceso a los datos
8. **Transferencias** - Transferencias internacionales
9. **Retención** - Tiempo de conservación de datos
10. **Seguridad** - Medidas de protección implementadas
11. **Ciclo de vida** - Fases del dato (recolección a eliminación)
12. **Riesgo** - Evaluación automatizada de riesgos
13. **Resumen** - Vista consolidada del RAT

#### **📊 Módulo de Reportes**
- RAT Maestro en Excel (todos los tratamientos)
- RAT Maestro en PDF (formato oficial)
- Dashboard con KPIs y gráficos interactivos
- Métricas de cumplimiento LOPDP

#### **💬 Módulo de Observaciones**
- Flujo de revisión DPO
- Observaciones por sección del RAT
- Estados: observado → en_correccion → subsanado

#### **🤖 Módulo de Asistente IA**
- Sugerencias para completar campos
- Validación de contenido regulatorio
- Chat interactivo con panel flotante
- Integración con OpenAI GPT-4o-mini

#### **📜 Módulo de Auditoría**
- Registro automático de todas las acciones (interceptor global)
- Historial completo por usuario
- Trazabilidad de cambios

### 2.3 Flujo de Estados del RAT

```
┌──────────┐    ┌────────────┐    ┌─────────┐    ┌─────────────────┐
│ BORRADOR │───►│ EN_EDICION │───►│ ENVIADO │───►│ EN_REVISION_DPO │
└──────────┘    └────────────┘    └─────────┘    └────────┬────────┘
                                                          │
                              ┌───────────────────────────┼───────────┐
                              ▼                           ▼           ▼
                        ┌──────────┐               ┌──────────┐  ┌──────────┐
                        │OBSERVADO │               │ VALIDADO │  │ RECHAZADO│
                        └────┬─────┘               └────┬─────┘  └──────────┘
                             │                          │
                             ▼                          ▼
                        ┌──────────┐              ┌──────────┐
                        │EN_CORREC.│              │ARCHIVADO │
                        └────┬─────┘              └──────────┘
                             │
                             ▼
                        ┌──────────┐
                        │SUBSANADO │
                        └────┬─────┘
                             │
                             └──────────────────────► (vuelve a EN_REVISION_DPO)
```

### 2.4 Modelo de Datos Principal

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Company   │◄────┤    Area     │◄────┤   Process   │◄────┤  Treatment  │
│  (Empresa)  │     │  (Área)     │     │  (Proceso)  │     │    (RAT)    │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                    ┌──────────────────────────────────────────────┼──────┐
                    │                                              │      │
                    ▼                                              ▼      ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
            │DataSubjectType│  │ DataCategory │  │  LegalBasis  │  │  ThirdParty │
            │ (Titulares)   │  │   (Datos)    │  │  (Base Legal)│  │  (Terceros) │
            └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘

            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
            │SecurityMeasure│  │RetentionRule │  │LifecyclePhase│  │    Risk     │
            │  (Seguridad)  │  │ (Retención)  │  │Ciclo de Vida │  │  (Riesgo)   │
            └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘
```

---

## 3. INFRAESTRUCTURA DE DESPLIEGUE

### 3.1 Opciones de Despliegue en Azure / AWS

Dado el requisito de Servientrega de desplegar en su infraestructura cloud (Azure o AWS), la aplicación está preparada para ambas plataformas mediante contenedores Docker.

#### **Opción A: Azure (Recomendada para empresas con ecosistema Microsoft)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AZURE                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Azure Container Apps / AKS                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │   Frontend   │  │   Backend    │  │      PostgreSQL          │  │    │
│  │  │   (Docker)   │  │   (Docker)   │  │   (Azure Database for    │  │    │
│  │  │   React+Nginx│  │   NestJS     │  │    PostgreSQL)           │  │    │
│  │  │   Puerto 80  │  │   Puerto 3001│  │                          │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │    │
│  │         │                 │                                         │    │
│  │         └─────────────────┘                                         │    │
│  │                   │                                                 │    │
│  │              Azure Load Balancer                                    │    │
│  │         (Distribución de tráfico + SSL)                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Servicios Adicionales:                                             │    │
│  │  - Azure Key Vault (secretos: JWT keys, DB passwords, OpenAI key)   │    │
│  │  - Azure Blob Storage (archivos adjuntos, reportes generados)       │    │
│  │  - Azure Monitor / Application Insights (logs y métricas)           │    │
│  │  - Azure CDN (distribución de assets estáticos)                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Servicios Azure recomendados:**

| Servicio | Propósito | Costo estimado (mensual) |
|----------|-----------|-------------------------|
| **Azure Container Apps** | Ejecución de contenedores frontend/backend | ~$30-80 |
| **Azure Database for PostgreSQL** | Base de datos administrada | ~$15-50 |
| **Azure Key Vault** | Gestión de secretos | ~$0.03/operación |
| **Azure Blob Storage** | Almacenamiento de archivos | ~$5-20 |
| **Azure Monitor** | Logs y métricas | ~$5-15 |
| **Azure CDN** | Distribución de contenido estático | ~$5-15 |

#### **Opción B: AWS**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Amazon ECS / EKS (Fargate)                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │   Frontend   │  │   Backend    │  │      PostgreSQL          │  │    │
│  │  │   (Docker)   │  │   (Docker)   │  │   (Amazon RDS for        │  │    │
│  │  │   React+Nginx│  │   NestJS     │  │    PostgreSQL)           │  │    │
│  │  │   Puerto 80  │  │   Puerto 3001│  │                          │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │    │
│  │         │                 │                                         │    │
│  │         └─────────────────┘                                         │    │
│  │                   │                                                 │    │
│  │         Application Load Balancer (ALB)                             │    │
│  │         (SSL/TLS + routing)                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Servicios Adicionales:                                             │    │
│  │  - AWS Secrets Manager (secretos y credenciales)                    │    │
│  │  - Amazon S3 (archivos adjuntos, reportes generados)                │    │
│  │  - Amazon CloudWatch (logs y métricas)                              │    │
│  │  - Amazon CloudFront (CDN para assets)                              │    │
│  │  - AWS WAF (Web Application Firewall)                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Servicios AWS recomendados:**

| Servicio | Propósito | Costo estimado (mensual) |
|----------|-----------|-------------------------|
| **Amazon ECS Fargate** | Ejecución de contenedores | ~$30-80 |
| **Amazon RDS PostgreSQL** | Base de datos administrada | ~$15-50 |
| **AWS Secrets Manager** | Gestión de secretos | ~$0.40/secret/mes |
| **Amazon S3** | Almacenamiento de archivos | ~$5-20 |
| **Amazon CloudWatch** | Logs y métricas | ~$5-15 |
| **Amazon CloudFront** | CDN | ~$5-15 |
| **AWS WAF** | Firewall de aplicación web | ~$5-20 |

### 3.2 Diagrama de Arquitectura de Despliegue

```
                              INTERNET
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Azure Front Door /   │
                    │   AWS CloudFront       │
                    │   (CDN + DDoS Protection)│
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   Load Balancer        │
                    │   (SSL Termination)    │
                    └───────────┬────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   Frontend      │ │   Backend       │ │   PostgreSQL    │
    │   Container     │ │   Container     │ │   (Managed DB)  │
    │                 │ │                 │ │                 │
    │  React + Nginx  │ │  NestJS API     │ │  Azure DB /     │
    │  (2 replicas)   │ │  (2 replicas)   │ │  Amazon RDS     │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   Servicios Externos   │
                    │   - OpenAI API         │
                    │   - SMTP (Email)       │
                    └────────────────────────┘
```

### 3.3 Requisitos de Infraestructura

| Recurso | Especificación Mínima | Recomendada |
|---------|----------------------|-------------|
| **Frontend** | 0.5 vCPU, 512 MB RAM | 1 vCPU, 1 GB RAM |
| **Backend** | 1 vCPU, 1 GB RAM | 2 vCPU, 2 GB RAM |
| **PostgreSQL** | 1 vCPU, 2 GB RAM, 20 GB SSD | 2 vCPU, 4 GB RAM, 50 GB SSD |
| **Storage** | 10 GB | 50 GB |
| **Red** | VPC privada, subnets públicas/privadas | Con NAT Gateway |

### 3.4 Seguridad en la Infraestructura

| Medida | Implementación |
|--------|---------------|
| **Encriptación en tránsito** | TLS 1.3 en todo el tráfico (HTTPS) |
| **Encriptación en reposo** | PostgreSQL con encriptación de disco |
| **Gestión de secretos** | Azure Key Vault / AWS Secrets Manager |
| **Firewall** | Security Groups / NSGs restrictivos |
| **WAF** | Azure WAF / AWS WAF para protección contra ataques web |
| **Red privada** | VPC/VNet con subnets privadas para BD |
| **Backup automático** | Snapshots diarios de BD, retención 30 días |
| **Monitoreo** | Logs centralizados, alertas de seguridad |

---

## 4. MANTENIMIENTO DE LA APLICACIÓN

### 4.1 Tipos de Mantenimiento

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MANTENIMIENTO DEL SOFTWARE                           │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│   CORRECTIVO     │   PREVENTIVO     │   EVOLUTIVO      │    ADAPTATIVO      │
├──────────────────┼──────────────────┼──────────────────┼────────────────────┤
│ - Corrección de  │ - Actualización  │ - Nuevas         │ - Adaptación a     │
│   bugs reportados│   de dependencias│   funcionalidades│   nuevas leyes     │
│ - Fixes de       │ - Parches de     │ - Mejoras de UX  │   (LOPDP)          │
│   seguridad      │   seguridad      │ - Optimizaciones │ - Cambios en       │
│ - Resolución de  │ - Backups        │   de performance │   regulaciones     │
│   incidentes     │   automáticos    │ - Integraciones  │   internacionales  │
│                  │ - Monitoreo 24/7 │   nuevas         │                    │
│                  │ - Optimización   │                  │                    │
│                  │   de queries     │                  │                    │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘
```

### 4.2 Plan de Mantenimiento Mensual

| Actividad | Frecuencia | Descripción |
|-----------|-----------|-------------|
| **Monitoreo de sistema** | Continuo | Uptime, performance, errores (Azure Monitor / CloudWatch) |
| **Backups de base de datos** | Diario | Snapshots automáticos con retención de 30 días |
| **Revisión de logs** | Semanal | Análisis de errores y comportamiento anómalo |
| **Actualización de parches de seguridad** | Mensual | Aplicación de patches críticos del SO y dependencias |
| **Actualización de dependencias** | Trimestral | Actualización de librerías npm (NestJS, React, Prisma) |
| **Revisión de rendimiento** | Trimestral | Optimización de queries, índices, caché |
| **Pruebas de recuperación** | Semestral | Test de restore de backups |
| **Auditoría de seguridad** | Anual | Revisión de vulnerabilidades, pentest básico |

### 4.3 Herramientas de Monitoreo

| Herramienta | Propósito |
|-------------|-----------|
| **Azure Monitor / CloudWatch** | Métricas de infraestructura, logs, alertas |
| **Application Insights / X-Ray** | Tracing de requests, performance de API |
| **Health Checks** | Endpoints de verificación de salud del sistema |
| **Log Aggregation** | Centralización de logs de todos los servicios |

### 4.4 Proceso de Soporte

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   REPORTE   │───►│  CLASIFICA- │───►│  RESOLUCIÓN │───►│   CIERRE    │
│   DE ISSUE  │    │   CIÓN      │    │             │    │             │
│  (Usuario/  │    │  (Prioridad)│    │  (Fix/Work- │    │  (Verifica- │
│   Sistema)  │    │             │    │   around)   │    │   ción)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

SLAs de Respuesta:
- Crítico (sistema caído): 2 horas
- Alto (funcionalidad afectada): 4 horas
- Medio (bug menor): 24 horas
- Bajo (mejora): 48-72 horas
```

---

## 5. MEJORAS Y DESPLIEGUES

### 5.1 Metodología de Desarrollo Continuo

Se utiliza **Git Flow** con integración continua (CI/CD) para despliegues seguros y controlados:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PIPELINE CI/CD (Azure DevOps / GitHub Actions)            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  PUSH    │──►│  BUILD   │──►│   TEST   │──►│  DEPLOY  │──►│  VERIFY  │  │
│  │  (dev)   │   │  & LINT  │   │  (Jest)  │   │  (stage) │   │  (smoke) │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  MERGE   │──►│  BUILD   │──►│   TEST   │──►│  DEPLOY  │──►│  VERIFY  │  │
│  │  (main)  │   │  & LINT  │   │  (Jest)  │   │  (prod)  │   │  (smoke) │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│                                                                             │
│  Estrategia de despliegue: Blue-Green (cero downtime)                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Proceso de Solicitud de Mejoras

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESO DE NUEVAS FUNCIONALIDADES                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FASE 1: REQUERIMIENTO                                                      │
│  ├── Servientrega solicita nueva funcionalidad vía ticket/formulario        │
│  ├── Se define alcance y objetivo                                           │
│  └── Se prioriza en el backlog                                              │
│                                                                             │
│  FASE 2: ANÁLISIS Y ESTIMACIÓN                                              │
│  ├── Análisis técnico de la mejora                                          │
│  ├── Estimación de horas/esfuerzo                                           │
│  ├── Propuesta de solución                                                  │
│  └── Aprobación de presupuesto por Servientrega                             │
│                                                                             │
│  FASE 3: DESARROLLO                                                         │
│  ├── Desarrollo en rama feature/                                            │
│  ├── Code review                                                            │
│  └── Testing en ambiente de desarrollo                                      │
│                                                                             │
│  FASE 4: PRUEBAS                                                            │
│  ├── Despliegue en ambiente de staging                                      │
│  ├── Pruebas funcionales (QA)                                               │
│  ├── Validación por Servientrega (UAT)                                      │
│  └── Aprobación para producción                                             │
│                                                                             │
│  FASE 5: DESPLIEGUE EN PRODUCCIÓN                                           │
│  ├── Despliegue controlado (ventana de mantenimiento si aplica)             │
│  ├── Monitoreo post-despliegue                                              │
│  └── Rollback plan si es necesario                                          │
│                                                                             │
│  FASE 6: DOCUMENTACIÓN Y CIERRE                                             │
│  ├── Actualización de documentación                                         │
│  ├── Capacitación a usuarios si aplica                                      │
│  └── Cierre del ticket                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Tipos de Mejoras Comunes

| Tipo | Ejemplos | Frecuencia típica |
|------|----------|-------------------|
| **Menor** | Ajustes de UI, campos adicionales, filtros | Semanal/Mensual |
| **Media** | Nuevos reportes, integraciones simples, workflows | Trimestral |
| **Mayor** | Nuevos módulos, cambios arquitectónicos, migraciones | Semestral/Anual |

### 5.4 Estrategia de Versionado

- **Versionado semántico:** MAJOR.MINOR.PATCH (ej: 1.2.3)
- **CHANGELOG** documentado por versión
- **Branches protegidas:** main requiere PR + aprobación
- **Tags** para cada release en producción

---

## 6. PROPUESTA COMERCIAL

### 6.1 Contexto del Mercado Ecuatoriano

Según investigación de mercado actualizada a 2026 para el sector de desarrollo de software en Ecuador y LATAM:

| Perfil | Tarifa por Hora (USD) | Características |
|--------|----------------------|-----------------|
| **Desarrollador Junior** | $15 - $25 | 0-2 años de experiencia, requiere supervisión |
| **Desarrollador Mid** | $25 - $45 | 2-5 años, autónomo en tareas estándar |
| **Desarrollador Senior** | $45 - $75 | 5+ años, lidera arquitectura y decisiones técnicas |
| **Arquitecto / Tech Lead** | $60 - $100 | Diseño de sistemas, mentoring, decisiones estratégicas |

**Referencia:** Tarifas LATAM 2026 (Vytra, Nogalnet, Yeeply)

### 6.2 Estimación del Desarrollo Inicial (Inversión Realizada)

La aplicación RAT es un sistema **empresarial complejo** con las siguientes características:

- **Tipo:** Aplicación web empresarial (SaaS interno)
- **Complejidad:** Alta (wizard de 13 pasos, flujo de aprobación, reportes, IA, auditoría)
- **Módulos:** 15+ módulos funcionales
- **Base de datos:** 30+ tablas relacionales
- **Seguridad:** RBAC, JWT, auditoría completa
- **Integraciones:** OpenAI, generación de PDF/Excel, email

**Estimación de horas de desarrollo:**

| Fase | Horas Estimadas | Descripción |
|------|----------------|-------------|
| **Análisis y diseño** | 80-120h | Requerimientos, arquitectura, modelo de datos |
| **Backend (NestJS + Prisma)** | 400-600h | API REST, lógica de negocio, autenticación, reportes |
| **Frontend (React)** | 350-500h | Interfaz de usuario, wizard, dashboards, tablas |
| **Base de datos** | 60-100h | Modelado, migraciones, índices, seeds |
| **Integraciones (IA, PDF, Email)** | 80-120h | OpenAI, Puppeteer, ExcelJS, Nodemailer |
| **Testing y QA** | 100-150h | Pruebas unitarias, integración, funcionales |
| **DevOps y despliegue** | 60-100h | Docker, CI/CD, configuración de ambientes |
| **Documentación** | 40-60h | Técnica y de usuario |
| **Buffer (15%)** | 175-260h | Contingencias |
| **TOTAL** | **1,345 - 2,010 horas** | |

**Valor estimado del desarrollo (tarifa senior $50-65/h):**

| Escenario | Tarifa/Hora | Horas | Inversión Total |
|-----------|------------|-------|-----------------|
| **Conservador** | $50 | 1,345h | **$67,250** |
| **Realista** | $55 | 1,600h | **$88,000** |
| **Completo** | $60 | 2,010h | **$120,600** |

> **Rango de inversión del desarrollo inicial: $67,000 - $120,000 USD**

### 6.3 Propuesta de Mantenimiento Mensual

El mantenimiento incluye:

| Servicio | Descripción |
|----------|-------------|
| **Monitoreo 24/7** | Uptime, performance, alertas automáticas |
| **Soporte técnico** | Atención a incidencias (SLA definido) |
| **Backups** | Diarios automáticos, retención 30 días |
| **Parches de seguridad** | Aplicación mensual de patches críticos |
| **Actualizaciones menores** | Actualización de dependencias trimestral |
| **Corrección de bugs** | Fixes de errores reportados |
| **Reportes mensuales** | Estado del sistema, métricas, incidentes |

**Opciones de mantenimiento:**

| Plan | Horas/Mes | Inversión Mensual (USD) | Ideal para |
|------|-----------|------------------------|------------|
| **Básico** | 10h | **$500 - $650** | Operación estable, pocos cambios |
| **Profesional** | 20h | **$1,000 - $1,300** | Operación normal, mejoras menores |
| **Empresarial** | 40h | **$2,000 - $2,600** | Operación crítica, mejoras continuas |

> **Recomendación para Servientrega: Plan Profesional ($1,000 - $1,300/mes)**
> Dado el carácter regulatorio de la aplicación (LOPDP) y la necesidad de cumplimiento continuo.

### 6.4 Propuesta de Mejoras y Evolutivo

Para nuevas funcionalidades o mejoras significativas:

| Tipo de Mejora | Ejemplos | Estimación |
|----------------|----------|------------|
| **Mejora menor** | Nuevo campo, ajuste de reporte, filtro adicional | $200 - $500 |
| **Mejora media** | Nuevo reporte, integración simple, flujo adicional | $500 - $1,500 |
| **Mejora mayor** | Nuevo módulo, integración compleja, rediseño | $1,500 - $5,000 |
| **Proyecto evolutivo** | Nuevo sistema vinculado, migración mayor | $5,000 - $15,000 |

**Modelo de contratación:**
- **Bolsa de horas prepagada:** Descuento del 10% por paquetes de 40+ horas
- **Precio fijo por feature:** Tras análisis y estimación conjunta
- **Retainer mensual evolutivo:** 20-40h/mes dedicadas a mejoras ($1,000 - $2,600/mes)

### 6.5 Resumen de Inversión Anual (Escenario Recomendado)

| Concepto | Frecuencia | Inversión |
|----------|-----------|-----------|
| **Desarrollo inicial** | Único (ya realizado) | $67,000 - $120,000 |
| **Mantenimiento Profesional** | Mensual | $1,000 - $1,300/mes |
| **Mantenimiento anual** | Anual | **$12,000 - $15,600** |
| **Mejoras evolutivas** | Variable | $5,000 - $15,000/año |
| **TOTAL ANUAL (post-desarrollo)** | | **$17,000 - $30,600** |

### 6.6 Comparativa de Costos: Desarrollar vs. Comprar

| Opción | Inversión Inicial | Anual | Consideraciones |
|--------|------------------|-------|-----------------|
| **Desarrollar esta app** | $67K - $120K | $17K - $31K | Propiedad total, personalizable, ajustada a LOPDP ecuatoriana |
| **Software LOPDP genérico** | $20K - $50K | $10K - $20K | Limitado, no personalizable, soporte externo |
| **Consultoría LOPDP manual** | - | $30K - $80K | Sin automatización, propenso a errores, no escalable |
| **No hacer nada** | - | Multas LOPDP: hasta $50K | Riesgo legal y reputacional |

### 6.7 Garantías y Compromisos

| Compromiso | Detalle |
|------------|---------|
| **Garantía de desarrollo** | 3 meses de corrección de bugs post-entrega sin costo |
| **Documentación** | Documentación técnica y de usuario incluida |
| **Capacitación** | Sesión de capacitación inicial para administradores |
| **Código fuente** | Entrega completa del código fuente y repositorio |
| **Escalabilidad** | Arquitectura preparada para crecimiento |
| **Cumplimiento** | Alineación con LOPDP ecuatoriana |

---

## ANEXOS

### Anexo A: Glosario de Términos Técnicos

| Término | Significado |
|---------|-------------|
| **API REST** | Interfaz de programación que permite comunicación entre sistemas vía HTTP |
| **JWT** | JSON Web Token - método seguro para transmitir información de autenticación |
| **ORM** | Object-Relational Mapping - herramienta que mapea objetos a tablas de BD |
| **SPA** | Single Page Application - aplicación web que carga una sola página |
| **RBAC** | Role-Based Access Control - control de acceso basado en roles |
| **CI/CD** | Continuous Integration / Continuous Deployment - automatización de despliegues |
| **Docker** | Plataforma de contenerización para empaquetar aplicaciones |
| **CDN** | Content Delivery Network - red de distribución de contenido |

### Anexo B: Diagrama de Flujo de Datos del RAT

```
USUARIO
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│  WIZARD RAT (13 Pasos)                                      │
│  1. Identificación → 2. Finalidad → 3. Titulares           │
│  4. Datos → 5. Base Legal → 6. Tecnologías                 │
│  7. Terceros → 8. Transferencias → 9. Retención            │
│  10. Seguridad → 11. Ciclo de Vida → 12. Riesgo            │
│  13. Resumen                                                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: Validación, Flujo de Estados, Auditoría           │
│  - Generación automática de código RAT                     │
│  - Evaluación de riesgo automatizada                       │
│  - Determinación de EIPD (Evaluación Impacto Protección Datos)│
└─────────────────────────────┬───────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
      ┌──────────┐     ┌──────────┐     ┌──────────┐
      │ PostgreSQL│     │ Reportes │     │    IA    │
      │  (Datos)  │     │Excel/PDF │     │Asistente │
      └──────────┘     └──────────┘     └──────────┘
```

---

**Documento preparado para:** Servientrega Ecuador
**Fecha de elaboración:** Abril 2026
**Contacto:** [Tu nombre / Empresa / Email / Teléfono]

---

*"Esta propuesta es confidencial y está dirigida exclusivamente a Servientrega Ecuador. Queda prohibida su reproducción total o parcial sin autorización expresa."*
