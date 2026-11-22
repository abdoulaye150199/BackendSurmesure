const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

function migrationDatabaseUrl(env) {
  const value = env.DIRECT_URL || env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL ou DIRECT_URL doit être configurée.');
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('URL de migration PostgreSQL invalide.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error('La migration nécessite une URL PostgreSQL.');
  if (url.hostname.endsWith('.neon.tech')) {
    url.hostname = url.hostname.replace(/-pooler(?=\.)/, '');
    url.searchParams.delete('pgbouncer');
  }
  return url.toString();
}
function isAdvisoryLockTimeout(output) {
  return output.includes('Timed out trying to acquire a postgres advisory lock');
}
function isProcessLimitError(result) {
  return (
    result.error?.code === 'EAGAIN' ||
    /\bspawn[^\r\n]*\bEAGAIN\b/.test(`${result.stdout || ''}\n${result.stderr || ''}`)
  );
}
function migrationEnvironment(env) {
  return {
    ...env,
    DATABASE_URL: migrationDatabaseUrl(env),
    // Shared hosts count threads towards the account's process limit.
    // Limit migration workers without changing the application's runtime.
    UV_THREADPOOL_SIZE: env.UV_THREADPOOL_SIZE || '1',
    TOKIO_WORKER_THREADS: env.TOKIO_WORKER_THREADS || '1',
    RAYON_NUM_THREADS: env.RAYON_NUM_THREADS || '1',
  };
}
async function main() {
  const root = resolve(__dirname, '..');
  if (existsSync(resolve(root, '.env'))) process.loadEnvFile(resolve(root, '.env'));
  const schema = resolve(root, 'prisma/schema.prisma');
  const env = migrationEnvironment(process.env);
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Application des migrations PostgreSQL (${attempt}/3)…`);
    const result = spawnSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema', schema],
      {
        cwd: root,
        env,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) return 0;
    const processLimit = isProcessLimitError(result);
    if (result.error)
      console.error(`Impossible de lancer Prisma (${result.error.code || 'erreur système'}).`);
    if (
      attempt === 3 ||
      (!processLimit && !isAdvisoryLockTimeout(`${result.stdout || ''}\n${result.stderr || ''}`))
    ) {
      if (processLimit)
        console.error(
          'Création de processus refusée (EAGAIN). Vérifiez les limites de processus et de mémoire du compte LWS dans cPanel.',
        );
      return result.status || 1;
    }
    if (processLimit)
      console.error(
        'Ressources temporairement indisponibles (EAGAIN). Nouvelle tentative dans 10 secondes…',
      );
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  return 1;
}
module.exports = {
  migrationDatabaseUrl,
  isAdvisoryLockTimeout,
  isProcessLimitError,
  migrationEnvironment,
};
if (require.main === module)
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
