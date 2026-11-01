const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');

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
  // Neon exposes the same endpoint directly without the "-pooler" suffix.
  if (url.hostname.endsWith('.neon.tech')) {
    url.hostname = url.hostname.replace(/-pooler(?=\.)/, '');
    url.searchParams.delete('pgbouncer');
  }
  return url.toString();
}

function isAdvisoryLockTimeout(output) {
  return output.includes('Timed out trying to acquire a postgres advisory lock');
}

async function main() {
  if (existsSync('.env')) process.loadEnvFile('.env');
  let databaseUrl;
  try {
    databaseUrl = migrationDatabaseUrl(process.env);
  } catch (error) {
    console.error(error.message);
    return 1;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Application des migrations (${attempt}/3)…`);
    const result = spawnSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) return 0;
    if (attempt === 3 || !isAdvisoryLockTimeout(`${result.stdout || ''}\n${result.stderr || ''}`))
      return result.status || 1;
    console.log('Verrou de migration occupé. Nouvelle tentative dans 10 secondes…');
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  return 1;
}

module.exports = { migrationDatabaseUrl, isAdvisoryLockTimeout };
if (require.main === module)
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      console.error(
        'Impossible de lancer les migrations. Vérifiez la configuration du déploiement.',
      );
      process.exitCode = 1;
    });
