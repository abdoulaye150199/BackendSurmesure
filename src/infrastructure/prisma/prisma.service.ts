import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../generated/client-postgresql';
import clientMetadata from '../../../generated/client-provider.json';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const provider = config.getOrThrow<string>('DATABASE_PROVIDER');
    const generatedProvider = clientMetadata.provider;
    if (provider !== generatedProvider) {
      throw new Error(`Prisma client ${generatedProvider} incompatible avec DATABASE_PROVIDER=${provider}. Générez le client correspondant.`);
    }
    const connectionLimit = config.getOrThrow<number>('DATABASE_POOL_SIZE');
    const poolTimeout = config.getOrThrow<number>('DATABASE_POOL_TIMEOUT_SECONDS');
    const databaseUrl = new URL(config.getOrThrow<string>('DATABASE_URL'));
    if (provider === 'postgresql') {
      databaseUrl.searchParams.set('connection_limit', String(connectionLimit));
      databaseUrl.searchParams.set('pool_timeout', String(poolTimeout));
    }
    super({ datasources: { db: { url: databaseUrl.toString() } } });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
