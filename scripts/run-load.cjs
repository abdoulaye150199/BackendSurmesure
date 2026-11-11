const { mkdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const profile = process.argv[2] || 'load';
if (!['smoke', 'load'].includes(profile)) throw new Error('Profil inconnu.');
mkdirSync(resolve(root, 'load-results'), { recursive: true });
const result = spawnSync(process.env.K6_BIN || 'k6', ['run', 'load/api.k6.js'], {
  cwd: root,
  env: { ...process.env, PROFILE: profile },
  stdio: 'inherit',
});
if (result.error) {
  console.error('k6 introuvable. Installer k6 ou définir K6_BIN. Voir load/README.md.');
}
process.exitCode = result.status ?? 1;
