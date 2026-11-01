import { ForbiddenException, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { ApiExceptionFilter } from './shared/presentation/api-exception.filter';

export function configureApplication(app: NestExpressApplication): void {
  const config = app.get(ConfigService);
  app.set('trust proxy', config.get<number>('TRUST_PROXY_HOPS', 0));
  app.use(helmet());
  app.useBodyParser('json', { limit: '256kb' });
  const allowedOrigins = new Set(
    config
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      const local =
        config.get<string>('NODE_ENV') === 'development' &&
        !!origin &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (origin === undefined || allowedOrigins.has(origin) || local) {
        callback(null, true);
      } else {
        callback(new ForbiddenException('Origine CORS non autorisée'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Request-Id'],
  });
  app.enableShutdownHooks();
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
}
