import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { z } from 'zod';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/identity/auth.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { HealthModule } from './modules/health/health.module';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32), JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'), JWT_REFRESH_TTL: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:8080'), LOG_LEVEL: z.string().default('info'),
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: (env) => envSchema.parse(env) }),
    LoggerModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({
      pinoHttp: { level: c.get('LOG_LEVEL', 'info'), redact: ['req.headers.authorization', 'req.body.password', 'res.headers["set-cookie"]'], genReqId: (req) => req.headers['x-request-id'] as string || randomUUID() },
    }) }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule, AuthModule, CommerceModule, HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
