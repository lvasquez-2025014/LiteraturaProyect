import 'reflect-metadata';
import * as dns from 'node:dns';
import * as dotenv from 'dotenv';
dotenv.config();

// Fallback de DNS en Windows para resolución fluida de MongoDB Atlas SRV
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignorar si el sistema restringe setServers
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost',
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir peticiones sin origen (curl, Postman, llamadas directas del servidor)
      if (!origin) return callback(null, true);
      // Permitir orígenes locales, Vercel (*.vercel.app) y el FRONTEND_URL configurado
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`[LecturaViva Backend] Servidor ejecutándose en http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('[LecturaViva Backend] Error fatal iniciando servidor:', err);
  process.exit(1);
});
