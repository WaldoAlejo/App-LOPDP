# Configuración de Base de Datos - Sistema RAT

## Base de datos en producción (GCP Cloud SQL)

- **Instancia:** `lopdp`
- **Motor:** PostgreSQL
- **IP pública:** `35.188.74.90`
- **Puerto:** `5432`
- **Usuario:** `postgres`
- **Base de datos:** `lopdp`
- **URL de conexión:** `postgresql://postgres:Esh2ew8p@35.188.74.90:5432/lopdp?schema=public&sslmode=require`

## Archivos de entorno

- `backend/.env` → Apunta a GCP (desarrollo contra la nube)
- `backend/.env.local` → Apunta a PostgreSQL local (para `docker-compose.local.yml`)
- `frontend/.env` → Apunta a `http://localhost:3001/api`

## Comandos útiles

```bash
# Verificar conexión a la base de datos
cd backend && npx ts-node scripts/check-db.ts

# Ejecutar migraciones
cd backend && npx prisma migrate dev

# Ejecutar seed
cd backend && npx prisma db seed

# Abrir Prisma Studio
cd backend && npx prisma studio
```

## Desarrollo local con Docker

```bash
docker-compose -f docker-compose.local.yml up
```

## Desarrollo contra GCP

```bash
docker-compose up
```

> Nota: El servicio `docker-compose.yml` principal no incluye base de datos local porque usa la base de datos en GCP.
