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
    GOOGLE_CLIENT_ID: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/)
      .optional(),
    SMTP_HOST: z.string().trim().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
    SMTP_SECURE: z.enum(['true', 'false']).default('true'),
    SMTP_USER: z.string().trim().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    MAIL_FROM: z.string().email().optional(),
    APP_PUBLIC_URL: z.string().url().default('https://www.surmesurestyle.com'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z
      .string()
      .url()
      .refine((value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
    DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
    DATABASE_POOL_TIMEOUT_SECONDS: z.coerce.number().int().min(1).max(120).default(10),
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
    const smtpFields = [env.SMTP_HOST, env.SMTP_USER, env.SMTP_PASSWORD, env.MAIL_FROM];
    if (smtpFields.some(Boolean) && !smtpFields.every(Boolean)) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'Configurez SMTP_HOST, SMTP_USER, SMTP_PASSWORD et MAIL_FROM ensemble.',
      });
    }
    if (env.SMTP_PORT === 465 && env.SMTP_SECURE !== 'true') {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_SECURE'],
        message: 'Le port SMTP 465 nécessite une connexion TLS directe.',
      });
    }
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
    if (
      env.NODE_ENV === 'production' &&
      env.CORS_ORIGINS.split(',').some((origin) => !origin.trim().startsWith('https://'))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGINS'],
        message: 'En production, toutes les origines CORS doivent utiliser HTTPS.',
      });
    }
  });
