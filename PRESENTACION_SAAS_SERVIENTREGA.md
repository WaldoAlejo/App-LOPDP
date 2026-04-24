# PRESENTACIÓN RESUMIDA - RAT SERVIENTREGA
## Modelo SaaS (Software as a Service)

---

## 1. ¿QUÉ ES EL MODELO SaaS?

```
┌─────────────────────────────────────────────────────────────────┐
│                        MODELO SaaS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SERVIENTREGA ──────► USA LA APLICACIÓN ◄─────── DESARROLLADOR │
│      (Cliente)         vía navegador web          (Nosotros)    │
│                                                                 │
│   ✅ No compra código        ✅ Mantenemos y mejoramos          │
│   ✅ No instala nada         ✅ Soporte incluido                │
│   ✅ Paga mensualidad        ✅ Siempre actualizado             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ventajas clave:**
- 💰 **Sin inversión inicial alta** (vs. $70K-$120K de desarrollo)
- 🚀 **Implementación inmediata**
- 🔧 **Sin equipo técnico interno necesario**
- 📈 **Escalable según necesidad**

---

## 2. TECNOLOGÍA

### Stack Moderno y Probado

```
FRONTEND:  React 19 + TypeScript + Vite + Tailwind CSS
BACKEND:   NestJS + Node.js + Prisma + PostgreSQL
REPORTES:  ExcelJS (Excel) + Puppeteer (PDF)
IA:        OpenAI GPT-4o-mini (Asistente integrado)
DEVOPS:    Docker + Nginx
```

**¿Por qué importa?**
- 🏦 Usado por bancos y empresas Fortune 500
- 🔒 Seguridad bancaria-nivel
- ⚡ Alto rendimiento
- 📚 Soporte garantizado por años

---

## 3. ESTRUCTURA DE LA APLICACIÓN

### Módulos Principales

| # | Módulo | ¿Qué hace? |
|---|--------|-----------|
| 1 | **Autenticación** | 8 roles, permisos granulares |
| 2 | **Wizard RAT** | 13 pasos para registrar tratamientos |
| 3 | **Flujo DPO** | Revisión, aprobación, observaciones |
| 4 | **Reportes** | Excel y PDF profesionales |
| 5 | **Dashboard** | KPIs y métricas LOPDP |
| 6 | **Auditoría** | Registro de todas las acciones |
| 7 | **Asistente IA** | Sugerencias y validación |

### El Wizard - 13 Pasos

```
Identificación → Finalidad → Titulares → Datos → Base Legal
→ Tecnologías → Terceros → Transferencias → Retención
→ Seguridad → Ciclo de Vida → Riesgo → Resumen
```

---

## 4. INFRAESTRUCTURA

### Despliegue en Azure/AWS de Servientrega

```
┌─────────────────────────────────────────┐
│           AZURE / AWS                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Frontend│  │ Backend │  │   BD    │ │
│  │ (Docker)│  │ (Docker)│  │PostgreSQL│ │
│  └─────────┘  └─────────┘  └─────────┘ │
│       │            │            │       │
│       └────────────┴────────────┘       │
│              Load Balancer               │
│                   │                      │
│              HTTPS/SSL                   │
└─────────────────────────────────────────┘
```

**Seguridad:**
- 🔒 TLS 1.3 en todo el tráfico
- 🔒 Base de datos encriptada
- 🔒 Secretos en Key Vault
- 🔒 Backups diarios automáticos
- 🔒 Firewall y WAF

**Costo infraestructura:** ~$55-$165/mes (pago directo a Microsoft/AWS)

---

## 5. MANTENIMIENTO

### ¿Qué está incluido?

| Servicio | Frecuencia |
|----------|-----------|
| Monitoreo 24/7 | Continuo |
| Backups | Diario |
| Parches de seguridad | Mensual |
| Actualizaciones | Trimestral |
| Reporte de estado | Mensual |

### SLAs de Soporte

| Prioridad | Respuesta |
|-----------|-----------|
| Crítico (caído) | 2 horas |
| Alto (afectado) | 4 horas |
| Medio (bug) | 24 horas |
| Bajo (mejora) | 48-72 horas |

---

## 6. MEJORAS

### Proceso Simple

```
1. Servientrega solicita
2. Estimamos esfuerzo
3. Aprueban presupuesto
4. Desarrollamos
5. Ustedes validan
6. Desplegamos (sin parar)
```

| Tipo | Ejemplo | Precio |
|------|---------|--------|
| Menor | Nuevo campo | $200-$500 |
| Media | Nuevo reporte | $500-$1,500 |
| Mayor | Nuevo módulo | $1,500-$5,000 |

---

## 7. PROPUESTA COMERCIAL

### 💰 Opciones de Contratación

#### **Opción A: Mensual (Recomendada)**

| Concepto | Precio |
|----------|--------|
| Licencia SaaS RAT | **$1,500 - $2,000/mes** |
| Incluye: acceso, mantenimiento, soporte, backups, actualizaciones |
| **Anual:** $18,000 - $24,000 |

#### **Opción B: Anual (10% descuento)**

| Concepto | Precio |
|----------|--------|
| Licencia SaaS RAT Anual | **$16,200 - $21,600** |
| (Equivale a $1,350 - $1,800/mes) |

#### **Opción C: Setup + Mensualidad Reducida**

| Concepto | Precio |
|----------|--------|
| Setup inicial (configuración + capacitación) | **$3,000 - $5,000** (único) |
| Mensualidad reducida | **$1,200 - $1,600/mes** |

---

### 📊 Comparativa

| Opción | Año 1 | Año 2+ |
|--------|-------|--------|
| **SaaS RAT** | $16K-$24K | $16K-$24K |
| Desarrollar desde cero | $70K-$120K | $17K-$31K |
| Consultoría manual | $30K-$80K | $30K-$80K |
| Multa LOPDP | Hasta $50K | Hasta $50K |

---

### ✅ Garantías

- 99.5% uptime garantizado
- Soporte máximo 4 horas
- Capacitación inicial incluida
- Documentación completa
- Cumplimiento LOPDP garantizado
- Backup y recuperación incluidos
- Auditorías de seguridad trimestrales

---

## 8. PREGUNTAS FRECUENTES

**¿Quién paga la infraestructura de Azure/AWS?**
→ Servientrega paga directamente a Microsoft/AWS (~$55-$165/mes)

**¿El código es de Servientrega?**
→ No. En modelo SaaS el código es propiedad del desarrollador. Ustedes acceden al servicio.

**¿Qué pasa si quieren cambiar de proveedor?**
→ Sus datos siempre son suyos. Podemos exportar todo en formato estándar.

**¿La aplicación cumple con la LOPDP?**
→ Sí. Fue diseñada específicamente para cumplir la ley ecuatoriana.

**¿Se puede integrar con otros sistemas?**
→ Sí. La arquitectura API REST permite integraciones con cualquier sistema.

**¿Cuántos usuarios incluye?**
→ Hasta 50 usuarios incluidos en la mensualidad.

---

## CONTACTO

**Desarrollador:** [Tu nombre]
**Email:** [tu email]
**Teléfono:** [tu teléfono]

---

*Documento preparado para Servientrega Ecuador - Abril 2026*
