# Configuración de Base de Datos - Sistema RAT

## ⚠️ Migración desde GCP (2026-08-23)

La instancia de GCP Cloud SQL (`lopdp`, IP `35.188.74.90`) y la VM que servía la app
(`35.222.179.61`) **fueron eliminadas de GCP**. Ya no existen y las credenciales que
aparecían antes en este archivo quedaron obsoletas — se removieron de este documento
porque nunca deben quedar en texto plano en un archivo versionado (lección aprendida:
no repetir este error con el nuevo proveedor).

**Reemplazo actual:** PostgreSQL gratuito en [Neon](https://neon.tech) (serverless,
compatible 1:1 con Prisma/PostgreSQL). Detalles completos de la migración y del estado
de la carga de datos en `SESION_2026-08-23_MIGRACION_NEON.md`.

La connection string real de Neon **solo vive en `backend/.env.local`** (gitignored,
nunca se commitea). Si estás retomando este proyecto en una máquina nueva:

1. Pide al DPO (dueño del proyecto) la connection string de Neon, o entra a
   [console.neon.tech](https://console.neon.tech) si tienes acceso a la cuenta.
2. Pégala como `DATABASE_URL` en `backend/.env.local` (ver `backend/.env.example` para
   el resto de variables requeridas).

## Archivos de entorno

- `backend/.env` → Plantilla/valores antiguos apuntando a GCP (obsoleto, ya no resuelve).
- `backend/.env.local` → **Este es el que se usa ahora.** Apunta a Neon. No versionado.
- `frontend/.env` → Apunta al backend local (`http://localhost:3001/api/v1`).

## Comandos útiles

```bash
# Ejecutar migraciones (contra lo que diga DATABASE_URL en .env.local)
cd backend && npx prisma migrate deploy

# Seed base (roles + superadmin opcional)
cd backend && npx ts-node prisma/seed.ts

# Cargar datos de Servientrega (empresa, áreas, procesos, usuarios líderes)
# ⚠️ Este script BORRA y recrea tratamientos/empresas/catálogos — solo correrlo
# en una base nueva o vacía, nunca contra una base con datos reales ya cargados.
cd backend && npx ts-node prisma/load-servientrega-data.ts

# Crear usuario DPO (Oswaldo Cevallos) y Líder de Seguridad (Christian Diaz)
cd backend && npx ts-node prisma/add-dpo-security-leader.ts

# Forzar cambio de contraseña obligatorio a todos los usuarios en su próximo login
cd backend && npx ts-node scripts/mark-force-password-change.ts

# Abrir Prisma Studio
cd backend && npx prisma studio
```

> **Nota Windows/OneDrive:** si el checkout del repo vive dentro de una carpeta
> sincronizada por OneDrive (u otro cliente de sincronización en la nube), los
> comandos de arriba —y sobre todo `npm run build`, `npm run start:dev` y
> `node dist/src/main.js`— pueden colgarse por minutos sin dar ningún error,
> porque el filtro de sincronización intercepta cada acceso a archivo dentro de
> `node_modules`/`dist`. Solución: clona/trabaja el repo en una ruta que NO esté
> dentro de OneDrive (ej. `C:\dev\App-LOPDP`).

## Desarrollo local con Docker

```bash
docker-compose -f docker-compose.local.yml up
```

> Nota: `docker-compose.local.yml` levanta un PostgreSQL local en un contenedor.
> Es una alternativa a Neon si prefieres no depender de un servicio externo.
