import { envSchema } from '../src/configuration/environment';
import { createRequestId } from '../src/configuration/request-id';
const valid = {
  DATABASE_URL: 'postgresql://test@localhost/surmesure_test',
  JWT_ACCESS_SECRET: 'access-secret-32-characters-minimum',
  JWT_REFRESH_SECRET: 'refresh-secret-32-characters-minimum',
};
describe('configuration contracts', () => {
  it('uses bounded defaults', () => {
    const config = envSchema.parse(valid);
    expect(config.PORT).toBe(3000);
    expect(config.TRUST_PROXY_HOPS).toBe(0);
  });
  it.each([
    { PORT: 70000 },
    { DATABASE_URL: 'https://example.com' },
    { JWT_ACCESS_TTL: 'invalid' },
    { JWT_REFRESH_TTL: 'invalid' },
    { JWT_ACCESS_TTL: '2h' },
    { CORS_ORIGINS: '*' },
    { CORS_ORIGINS: 'ftp://example.com' },
    { LOG_LEVEL: 'unknown' },
    { TRUST_PROXY_HOPS: 10 },
  ])('rejects invalid configuration %#', (update) => {
    expect(() => envSchema.parse({ ...valid, ...update })).toThrow();
  });
  it('rejects shared token secrets and development secrets in production', () => {
    expect(() =>
      envSchema.parse({ ...valid, JWT_REFRESH_SECRET: valid.JWT_ACCESS_SECRET }),
    ).toThrow();
    expect(() =>
      envSchema.parse({
        ...valid,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'change-me-with-at-least-32-characters',
      }),
    ).toThrow();
  });
  it('accepts explicit production origins', () => {
    expect(
      envSchema.parse({
        ...valid,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://surmesure-front.vercel.app',
      }).NODE_ENV,
    ).toBe('production');
  });
  it('accepts a complete SMTP configuration and rejects partial settings', () => {
    expect(
      envSchema.parse({
        ...valid,
        SMTP_HOST: 'mail.example.com',
        SMTP_PORT: '465',
        SMTP_SECURE: 'true',
        SMTP_USER: 'welcome@example.com',
        SMTP_PASSWORD: 'secret',
        MAIL_FROM: 'welcome@example.com',
      }).SMTP_PORT,
    ).toBe(465);
    expect(() => envSchema.parse({ ...valid, SMTP_HOST: 'mail.example.com' })).toThrow();
    expect(() => envSchema.parse({ ...valid, SMTP_PORT: 465, SMTP_SECURE: 'false' })).toThrow();
  });
  it('preserves safe request IDs and replaces arbitrary incoming values', () => {
    const uuid = '11111111-1111-4111-8111-111111111111';
    expect(createRequestId(uuid)).toBe(uuid);
    for (const input of [undefined, ['one', 'two'], 'untrusted']) {
      expect(createRequestId(input)).toMatch(/^[\da-f-]{36}$/);
    }
  });
});
