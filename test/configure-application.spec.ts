import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configureApplication } from '../src/configure-application';

type CorsOriginCheck = (
  origin: string | undefined,
  callback: (error: Error | null, allowed?: boolean) => void,
) => void;

describe('HTTP application configuration', () => {
  const setup = (environment: string) => {
    const values: Record<string, string | number> = {
      CORS_ORIGINS: 'https://surmesure.example, https://admin.example',
      NODE_ENV: environment,
      TRUST_PROXY_HOPS: 1,
    };
    let originCheck: CorsOriginCheck | undefined;
    const app = {
      get: jest.fn().mockReturnValue({
        get: (key: string, fallback?: unknown) => values[key] ?? fallback,
        getOrThrow: (key: string) => {
          if (!(key in values)) {
            throw new Error(`Missing ${key}`);
          }
          return values[key];
        },
      } as ConfigService),
      set: jest.fn(),
      use: jest.fn(),
      useBodyParser: jest.fn(),
      enableCors: jest.fn((options: { origin: CorsOriginCheck }) => {
        originCheck = options.origin;
      }),
      enableShutdownHooks: jest.fn(),
      enableVersioning: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
    };

    configureApplication(app as unknown as NestExpressApplication);
    if (!originCheck) {
      throw new Error('CORS origin callback missing');
    }
    const checkCorsOrigin = originCheck;

    return {
      app,
      checkOrigin: (origin?: string) =>
        new Promise<{ error: Error | null; allowed?: boolean }>((resolve) => {
          checkCorsOrigin(origin, (error, allowed) => resolve({ error, allowed }));
        }),
    };
  };

  it('allows requests without an origin and configured origins', async () => {
    const { checkOrigin } = setup('production');
    await expect(checkOrigin()).resolves.toEqual({ error: null, allowed: true });
    await expect(checkOrigin('https://surmesure.example')).resolves.toEqual({
      error: null,
      allowed: true,
    });
  });

  it('allows localhost only in development', async () => {
    const development = setup('development');
    await expect(development.checkOrigin('http://localhost:4200')).resolves.toEqual({
      error: null,
      allowed: true,
    });
    await expect(development.checkOrigin('https://127.0.0.1')).resolves.toEqual({
      error: null,
      allowed: true,
    });

    const production = setup('production');
    const { error, allowed } = await production.checkOrigin('http://localhost:4200');
    expect(error).toBeInstanceOf(ForbiddenException);
    expect(allowed).toBe(false);
  });

  it('rejects unconfigured external origins', async () => {
    const { checkOrigin } = setup('development');
    const { error, allowed } = await checkOrigin('https://attacker.example');
    expect(error).toBeInstanceOf(ForbiddenException);
    expect(allowed).toBe(false);
  });
});
