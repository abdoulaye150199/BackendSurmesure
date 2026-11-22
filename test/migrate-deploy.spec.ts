const { migrationDatabaseUrl, isAdvisoryLockTimeout, isProcessLimitError, migrationEnvironment } =
  require('../scripts/migrate-deploy.cjs') as {
    migrationDatabaseUrl(env: Record<string, string>): string;
    isAdvisoryLockTimeout(output: string): boolean;
    isProcessLimitError(result: {
      error?: { code: string };
      stdout?: string;
      stderr?: string;
    }): boolean;
    migrationEnvironment(env: Record<string, string>): Record<string, string>;
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

  it('recognizes process exhaustion in both the launcher and the Prisma engine', () => {
    expect(isProcessLimitError({ error: { code: 'EAGAIN' } })).toBe(true);
    expect(isProcessLimitError({ stderr: 'Error: spawn /backend/schema-engine EAGAIN' })).toBe(
      true,
    );
    expect(isProcessLimitError({ error: { code: 'ENOENT' } })).toBe(false);
    expect(isProcessLimitError({ stderr: 'P3009 failed migration' })).toBe(false);
    expect(isProcessLimitError({ stderr: 'P1001 Cannot reach database' })).toBe(false);
    expect(isProcessLimitError({ stderr: 'P3018 SQL error: column "EAGAIN" does not exist' })).toBe(
      false,
    );
  });

  it('limits migration threads without changing the runtime environment', () => {
    const env = { DATABASE_URL: 'postgresql://user:password@localhost:5432/db' };
    expect(migrationEnvironment(env)).toEqual({
      ...env,
      UV_THREADPOOL_SIZE: '1',
      TOKIO_WORKER_THREADS: '1',
      RAYON_NUM_THREADS: '1',
    });
    expect(env).not.toHaveProperty('UV_THREADPOOL_SIZE');
  });

  it('preserves explicitly configured thread limits and direct database selection', () => {
    expect(
      migrationEnvironment({
        DATABASE_URL: 'postgresql://user:password@pooled.example/db',
        DIRECT_URL: 'postgresql://user:password@direct.example/db',
        UV_THREADPOOL_SIZE: '2',
        TOKIO_WORKER_THREADS: '3',
        RAYON_NUM_THREADS: '4',
      }),
    ).toMatchObject({
      DATABASE_URL: 'postgresql://user:password@direct.example/db',
      UV_THREADPOOL_SIZE: '2',
      TOKIO_WORKER_THREADS: '3',
      RAYON_NUM_THREADS: '4',
    });
  });
});
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

describe('migration process retries', () => {
  const source = readFileSync(resolve(__dirname, '../scripts/migrate-deploy.cjs'), 'utf8');
  type Result = {
    status: number | null;
    stderr?: string;
    error?: { code: string };
  };
  async function run(results: Result[]) {
    const spawn = jest.fn();
    for (const result of results) {
      spawn.mockReturnValueOnce(result);
    }
    const module = { exports: {} };
    const requireMock = Object.assign(
      (name: string) => {
        if (name === 'node:child_process') {
          return { spawnSync: spawn };
        }
        if (name === 'node:fs') {
          return { existsSync: () => false };
        }
        if (name === 'node:path') {
          return { resolve };
        }
        throw new Error(`Unexpected dependency: ${name}`);
      },
      { main: module, resolve: () => 'prisma-cli' },
    );
    const wait = jest.fn((done: () => void) => done());
    const process = {
      env: { DATABASE_URL: 'postgresql://user:password@localhost:5432/db' },
      execPath: '/node',
      exitCode: undefined as number | undefined,
      stdout: { write: jest.fn() },
      stderr: { write: jest.fn() },
    };
    await runInNewContext(source, {
      require: requireMock,
      module,
      __dirname: '/backend/scripts',
      URL,
      process,
      console: { log: jest.fn(), error: jest.fn() },
      setTimeout: wait,
    });
    return { spawn, wait, exitCode: process.exitCode };
  }

  it.each([
    { status: null, error: { code: 'EAGAIN' } },
    { status: 1, stderr: 'spawn /backend/schema-engine EAGAIN' },
  ])('recovers from temporary process exhaustion: %j', async (failure) => {
    const result = await run([failure, { status: 0 }]);
    expect(result.exitCode).toBe(0);
    expect(result.spawn).toHaveBeenCalledTimes(2);
    expect(result.wait).toHaveBeenCalledWith(expect.any(Function), 10_000);
    expect(result.spawn.mock.calls[0][2].env.TOKIO_WORKER_THREADS).toBe('1');
  });

  it('stops after three process failures with a nonzero exit code', async () => {
    const failure = { status: 1, stderr: 'spawn /backend/schema-engine EAGAIN' };
    const result = await run([failure, failure, failure]);
    expect(result.exitCode).toBe(1);
    expect(result.spawn).toHaveBeenCalledTimes(3);
    expect(result.wait).toHaveBeenCalledTimes(2);
  });

  it('does not retry a failed database migration', async () => {
    const result = await run([{ status: 1, stderr: 'P3009 failed migration' }]);
    expect(result.exitCode).toBe(1);
    expect(result.spawn).toHaveBeenCalledTimes(1);
    expect(result.wait).not.toHaveBeenCalled();
  });
});
