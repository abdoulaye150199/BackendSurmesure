import { z } from 'zod';
import { tokenDurationSeconds } from '../modules/identity/domain/token-duration';

const duration = z.string().refine((value) => {
  try {
    tokenDurationSeconds(value);
    return true;
  } catch {
    return false;
  }
}, 'Durée invalide : utilisez un entier positif suivi de s, m, h ou d.');

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z
      .string()
      .url()
      .refine((value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: duration
      .refine(
        (value) => tokenDurationSeconds(value) <= 3600,
        'Un jeton d’accès ne peut pas dépasser une heure.',
      )
      .default('15m'),
    JWT_REFRESH_TTL: duration.default('30d'),
    CORS_ORIGINS: z
      .string()
      .refine(
        (value) =>
          value.split(',').every((origin) => {
            try {
              const url = new URL(origin.trim());
              return ['https:', 'http:'].includes(url.protocol) && url.origin === origin.trim();
            } catch {
              return false;
            }
          }),
        'Déclarez des origines HTTP(S) exactes séparées par des virgules.',
      )
      .default('http://localhost:8080'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  })
  .superRefine((env, context) => {
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'Les secrets des jetons d’accès et de renouvellement doivent être différents.',
      });
    }
    if (
      env.NODE_ENV === 'production' &&
      [env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET].some((secret) =>
        /^(change-me|test-)/i.test(secret),
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_ACCESS_SECRET'],
        message: 'Utilisez des secrets de production dédiés.',
      });
    }
  });
