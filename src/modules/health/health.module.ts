import { Controller, Get, Module } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  TerminusModule,
} from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
@Controller('health')
class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly db: PrismaService,
  ) {}
  @Get('live') live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  @Get('ready') @HealthCheck() ready() {
    return this.health.check([
      async () => {
        const check = this.indicator.check('database');
        try {
          await this.db.$queryRaw`SELECT 1`;
          return check.up();
        } catch {
          return check.down({ message: 'Connexion indisponible' });
        }
      },
    ]);
  }
}
@Module({ imports: [TerminusModule], controllers: [HealthController] })
export class HealthModule {}
