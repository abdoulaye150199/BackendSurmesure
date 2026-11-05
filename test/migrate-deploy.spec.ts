const { migrationDatabaseUrl, isAdvisoryLockTimeout } =
  require('../scripts/migrate-deploy.cjs') as {
    migrationDatabaseUrl(env: Record<string, string>): string;
    isAdvisoryLockTimeout(output: string): boolean;
  };

describe('deployment migration connection', () => {
  it('uses a direct Neon connection without changing the application URL', () => {
    const env = {
      DATABASE_URL:
        'postgresql://user:password@ep-example-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true',
    };
    const original = env.DATABASE_URL;
    const selected = new URL(migrationDatabaseUrl(env));
    expect(selected.hostname).toBe('ep-example.c-2.us-east-2.aws.neon.tech');
    expect(selected.pathname).toBe('/neondb');
    expect(selected.searchParams.get('sslmode')).toBe('require');
    expect(selected.searchParams.has('pgbouncer')).toBe(false);
    expect(selected.username).toBe('user');
    expect(env.DATABASE_URL).toBe(original);
  });

  it('prioritizes the explicitly configured direct connection', () => {
    const env = {
      DATABASE_URL: 'postgresql://user:password@pooled.example/db',
      DATABASE_URL_UNPOOLED: 'postgresql://user:password@unpooled.example/db',
      DIRECT_URL: 'postgresql://user:password@direct.example/db',
    };
    expect(new URL(migrationDatabaseUrl(env)).hostname).toBe('direct.example');
    delete (env as Partial<typeof env>).DIRECT_URL;
    expect(new URL(migrationDatabaseUrl(env)).hostname).toBe('unpooled.example');
  });

  it('keeps local PostgreSQL settings and rejects invalid configuration without exposing credentials', () => {
    const local = 'postgresql://user:password@localhost:5434/surmesure?schema=public';
    expect(migrationDatabaseUrl({ DATABASE_URL: local })).toBe(local);
    expect(() => migrationDatabaseUrl({})).toThrow('doit être configurée');
    expect(() => migrationDatabaseUrl({ DATABASE_URL: 'secret-invalid-value' })).toThrow(
      'URL de migration PostgreSQL invalide',
    );
  });

  it('retries advisory lock contention but not migration SQL failures', () => {
    expect(
      isAdvisoryLockTimeout('P1002: Timed out trying to acquire a postgres advisory lock'),
    ).toBe(true);
    expect(isAdvisoryLockTimeout('P3009 failed migration')).toBe(false);
    expect(isAdvisoryLockTimeout('P1002: database connection timeout')).toBe(false);
  });

});
