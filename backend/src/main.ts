import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: solo permite el origen configurado en FRONTEND_URL
  // En desarrollo se puede usar FRONTEND_URL=http://localhost:5173
  // En producción se configura la URL real del frontend
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = new Set<string>();

  if (frontendUrl) {
    frontendUrl
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => allowedOrigins.add(origin));
  }

  // En desarrollo, permitir localhost si no hay FRONTEND_URL configurada
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev && allowedOrigins.size === 0) {
    allowedOrigins.add('http://localhost:5173');
    allowedOrigins.add('http://127.0.0.1:5173');
    allowedOrigins.add('http://localhost:5174');
    allowedOrigins.add('http://127.0.0.1:5174');
  }

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`CORS allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
}
bootstrap();
