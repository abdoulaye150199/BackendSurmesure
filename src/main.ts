import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  const configuredOrigins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const isDevelopment = config.get<string>('NODE_ENV') === 'development';
  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      const localDevelopmentOrigin =
        isDevelopment &&
        origin != null &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (origin == null || configuredOrigins.includes(origin) || localDevelopmentOrigin) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin CORS non autorisée: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Request-Id'],
  });
  app.enableShutdownHooks();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const document = SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle('SurMesure API').setDescription('API mobile SurMesure').setVersion('1.0')
    .addBearerAuth().build());
  SwaggerModule.setup('docs', app, document);
  await app.listen(config.get<number>('PORT', 3000), '0.0.0.0');
}
void bootstrap();
