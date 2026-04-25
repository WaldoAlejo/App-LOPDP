# 🔒 Guía de Seguridad - RAT Servientrega

## Resumen de Medidas de Seguridad Implementadas

### 1. Headers de Seguridad HTTP (Helmet)
- **Content-Security-Policy**: Restringe fuentes de contenido
- **HSTS**: Fuerza HTTPS con preload
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing

### 2. Rate Limiting (Throttler)
| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Login | 5 intentos | 15 segundos |
| Refresh token | 10 intentos | 1 minuto |
| Forgot password | 3 intentos | 1 hora |
| Reset password | 5 intentos | 1 minuto |
| API general | 10 req/seg, 100/min, 500/10min | - |

### 3. CORS Restringido
- Solo permite orígenes configurados en `FRONTEND_URL`
- En desarrollo: localhost:5173/5174
- En producción: dominio específico

### 4. Validación de Inputs
- Todos los DTOs usan `class-validator`
- Sanitización de strings contra XSS (`SanitizePipe` global)
- `whitelist: true` y `forbidNonWhitelisted: true`

### 5. Política de Contraseñas
- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
- Máximo 128 caracteres
- No puede ser igual a la anterior

### 6. Manejo de Errores
- `AllExceptionsFilter` global
- Errores de Prisma sanitizados (no filtran detalles de BD)
- En producción: solo mensajes genéricos
- En desarrollo: mensajes de debug incluidos

### 7. Docker Seguro
- Contenedores corren con usuario no-root
- `no-new-privileges:true`
- Sistemas de archivos read-only con tmpfs
- PostgreSQL NO expuesto al host

### 8. Nginx Seguro
- Headers de seguridad HTTP
- Límite de body (10M)
- Gzip compression
- Cache de assets estáticos

### 9. TLS/SSL
- `rejectUnauthorized: true`
- `minVersion: TLSv1.2`
- SSLv3 y cifrados débiles eliminados

### 10. JWT Seguro
- Access tokens: 15 minutos
- Refresh tokens: 7 días
- Invalidación al cambiar contraseña
- Secretos separados para access y refresh

## Checklist Pre-Despliegue

- [ ] Generar JWT_SECRET y JWT_REFRESH_SECRET con `openssl rand -base64 64`
- [ ] Configurar FRONTEND_URL con dominio HTTPS
- [ ] Verificar que .env NO está en git (`git ls-files | grep \\.env`)
- [ ] Configurar SMTP con credenciales seguras
- [ ] Cambiar contraseña del superadmin seed
- [ ] Habilitar HTTPS en producción
- [ ] Configurar firewall (solo puertos 80/443)
- [ ] Revisar logs de auditoría regularmente

## Rotación de Secretos

Si se sospecha de compromiso:
1. Generar nuevos JWT_SECRET y JWT_REFRESH_SECRET
2. Forzar logout de todos los usuarios (limpiar tabla RefreshToken)
3. Cambiar contraseñas de SMTP y base de datos
4. Revisar logs de auditoría

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:
1. NO la reportes públicamente
2. Contacta al equipo de seguridad interno
3. Proporciona detalles de reproducción
4. Espera confirmación antes de divulgar
