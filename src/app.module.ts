import { envSchema } from './configuration/environment';
import { createRequestId } from './configuration/request-id';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/identity/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: (env) => envSchema.parse(env) }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', 'info'),
          redact: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.currentPassword',
            'req.body.newPassword',
            'req.body.refreshToken',
            'res.headers["set-cookie"]',
          ],
          genReqId: (request) => createRequestId(request.headers['x-request-id']),
        },
      }),
    }),
    // The default storage is process-local. Production multi-instance deployments
    // must configure a shared ThrottlerStorage (for example Redis).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    CommerceModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
