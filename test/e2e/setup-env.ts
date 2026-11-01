const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL doit pointer vers une base de tests jetable.');
}
const parsedDatabaseUrl = new URL(databaseUrl);
if (
  !['localhost', '127.0.0.1', 'postgres'].includes(parsedDatabaseUrl.hostname) ||
  !parsedDatabaseUrl.pathname.endsWith('_test')
) {
  throw new Error(
    'Les tests destructifs sont limités aux bases locales dont le nom termine par _test.',
  );
}
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_ACCESS_SECRET = 'quality-test-only-access-secret-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'quality-test-only-refresh-secret-at-least-32-characters';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '30d';
process.env.CORS_ORIGINS = 'http://localhost:4200';
