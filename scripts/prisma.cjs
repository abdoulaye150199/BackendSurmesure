const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

if (existsSync(path.resolve(__dirname, '..', '.env'))) process.loadEnvFile(path.resolve(__dirname, '..', '.env'));

const args = process.argv.slice(2);
const isSeed = args[0] === 'seed';
const provider = isSeed ? process.env.DATABASE_PROVIDER || 'postgresql' : args.shift();
if (!['postgresql', 'mysql'].includes(provider)) {
  console.error('Choisissez explicitement postgresql ou mysql (DATABASE_PROVIDER).');
  process.exit(2);
}
const schema = `prisma/${provider}/schema.prisma`;
if (!existsSync(schema)) throw new Error(`Schéma Prisma absent : ${schema}`);
const url = process.env.DATABASE_URL;
let urlProtocol;
try { urlProtocol = url ? new URL(url).protocol : undefined; } catch { urlProtocol = undefined; }
const expected = provider === 'mysql' ? ['mysql:'] : ['postgres:', 'postgresql:'];
if ((!urlProtocol || !expected.includes(urlProtocol)) && args[0] === 'validate') {
  process.env.DATABASE_URL = provider === 'mysql'
    ? 'mysql://validation:validation@localhost:3306/validation'
    : 'postgresql://validation:validation@localhost:5432/validation';
}
const selectedUrl = process.env.DATABASE_URL;
if (!selectedUrl) throw new Error('DATABASE_URL doit être configurée.');
let protocol;
try { protocol = new URL(selectedUrl).protocol; } catch { throw new Error('DATABASE_URL invalide.'); }
if (!expected.includes(protocol)) throw new Error(`DATABASE_URL ne correspond pas au moteur ${provider}.`);
const env = { ...process.env, DATABASE_PROVIDER: provider };
const prisma = require.resolve('prisma/build/index.js');
if (isSeed) {
  const metadataPath = path.resolve(__dirname, '..', 'generated/client-provider.json');
  if (!existsSync(metadataPath) || require(metadataPath).provider !== provider) throw new Error(`Client Prisma incompatible avec ${provider}; générez-le d'abord.`);
  const result = spawnSync(process.execPath, [require.resolve('tsx/dist/cli.mjs'), 'prisma/seed.ts'], { stdio: 'inherit', env });
  process.exit(result.status ?? 1);
}
const [command, ...rest] = args;
if (command === 'generate' && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = provider === 'mysql' ? 'mysql://generate:generate@localhost:3306/generate' : 'postgresql://generate:generate@localhost:5432/generate';
}
if (command === 'migrate' && rest[0] === 'deploy') {
  const result = spawnSync(process.execPath, [require.resolve('./migrate-deploy.cjs'), provider], { stdio: 'inherit', env });
  process.exit(result.status ?? 1);
}
if (command === 'generate') {
  const result = spawnSync(process.execPath, [prisma, 'generate', '--schema', schema], { stdio: 'inherit', env: { ...env, DATABASE_URL: selectedUrl } });
  if (result.status !== 0) process.exit(result.status ?? 1);
  mkdirSync('generated', { recursive: true });
  writeFileSync('generated/client-provider.json', JSON.stringify({ provider }, null, 2) + '\n');
} else {
  const result = spawnSync(process.execPath, [prisma, command, ...rest, '--schema', schema], { stdio: 'inherit', env: { ...env, DATABASE_URL: selectedUrl } });
  process.exit(result.status ?? 1);
}
