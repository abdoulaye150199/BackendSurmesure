const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

function migrationDatabaseUrl(env, provider = env.DATABASE_PROVIDER || 'postgresql') {
  const value = provider === 'mysql'
    ? env.DATABASE_URL
    : env.DIRECT_URL || env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL ou DIRECT_URL doit être configurée.');
  let url;
  try { url = new URL(value); } catch {
    throw new Error(provider === 'postgresql' ? 'URL de migration PostgreSQL invalide.' : 'URL de migration MySQL invalide.');
  }
  if (provider === 'mysql' ? url.protocol !== 'mysql:' : !['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error(`L’URL de migration ne correspond pas au moteur ${provider}.`);
  if (provider === 'postgresql' && url.hostname.endsWith('.neon.tech')) {
    url.hostname = url.hostname.replace(/-pooler(?=\.)/, '');
    url.searchParams.delete('pgbouncer');
  }
  return url.toString();
}
function isAdvisoryLockTimeout(output) {
  return output.includes('Timed out trying to acquire a postgres advisory lock');
}
async function main() {
  const root = resolve(__dirname, '..');
  if (existsSync(resolve(root, '.env'))) process.loadEnvFile(resolve(root, '.env'));
  const provider = process.argv[2] || process.env.DATABASE_PROVIDER || 'postgresql';
  if (!['postgresql', 'mysql'].includes(provider)) throw new Error('DATABASE_PROVIDER invalide.');
  const schema = resolve(root, `prisma/${provider}/schema.prisma`);
  const generatedMetadata = resolve(root, 'generated/client-provider.json');
  if (!existsSync(generatedMetadata) || require(generatedMetadata).provider !== provider)
    throw new Error(`Client Prisma généré incompatible avec ${provider}; exécutez npm run prisma:generate:${provider}.`);
  const databaseUrl = migrationDatabaseUrl(process.env, provider);
  for (let attempt = 1; attempt <= (provider === 'postgresql' ? 3 : 1); attempt++) {
    console.log(`Application des migrations ${provider} (${attempt})…`);
    const result = spawnSync(process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema', schema],
      { cwd: root, env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) return 0;
    if (attempt === (provider === 'postgresql' ? 3 : 1) || !isAdvisoryLockTimeout(`${result.stdout || ''}\n${result.stderr || ''}`)) return result.status || 1;
    await new Promise(resolve => setTimeout(resolve, 10_000));
  }
  return 1;
}
module.exports = { migrationDatabaseUrl, isAdvisoryLockTimeout };
if (require.main === module) main().then(code => { process.exitCode = code; }).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
