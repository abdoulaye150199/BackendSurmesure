import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    GOOGLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    DATABASE_POOL_SIZE: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_POOL_TIMEOUT_SECONDS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_TTL: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_TTL: z.ZodDefault<z.ZodString>;
    CORS_ORIGINS: z.ZodDefault<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        fatal: "fatal";
        warn: "warn";
        info: "info";
        debug: "debug";
        trace: "trace";
        silent: "silent";
    }>>;
    TRUST_PROXY_HOPS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
