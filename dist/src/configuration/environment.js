"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
const token_duration_1 = require("../modules/identity/domain/token-duration");
const duration = zod_1.z.string().refine((value) => {
    try {
        (0, token_duration_1.tokenDurationSeconds)(value);
        return true;
    }
    catch {
        return false;
    }
}, 'Durée invalide : utilisez un entier positif suivi de s, m, h ou d.');
exports.envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    GOOGLE_CLIENT_ID: zod_1.z
        .string()
        .regex(/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/)
        .optional(),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: zod_1.z
        .string()
        .url()
        .refine((value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
    DATABASE_POOL_SIZE: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    DATABASE_POOL_TIMEOUT_SECONDS: zod_1.z.coerce.number().int().min(1).max(120).default(10),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_TTL: duration
        .refine((value) => (0, token_duration_1.tokenDurationSeconds)(value) <= 3600, 'Un jeton d’accès ne peut pas dépasser une heure.')
        .default('15m'),
    JWT_REFRESH_TTL: duration.default('30d'),
    CORS_ORIGINS: zod_1.z
        .string()
        .refine((value) => value.split(',').every((origin) => {
        try {
            const url = new URL(origin.trim());
            return ['https:', 'http:'].includes(url.protocol) && url.origin === origin.trim();
        }
        catch {
            return false;
        }
    }), 'Déclarez des origines HTTP(S) exactes séparées par des virgules.')
        .default('http://localhost:8080'),
    LOG_LEVEL: zod_1.z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .default('info'),
    TRUST_PROXY_HOPS: zod_1.z.coerce.number().int().min(0).max(5).default(0),
})
    .superRefine((env, context) => {
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
        context.addIssue({
            code: 'custom',
            path: ['JWT_REFRESH_SECRET'],
            message: 'Les secrets des jetons d’accès et de renouvellement doivent être différents.',
        });
    }
    if (env.NODE_ENV === 'production' &&
        [env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET].some((secret) => /^(change-me|test-)/i.test(secret))) {
        context.addIssue({
            code: 'custom',
            path: ['JWT_ACCESS_SECRET'],
            message: 'Utilisez des secrets de production dédiés.',
        });
    }
});
//# sourceMappingURL=environment.js.map