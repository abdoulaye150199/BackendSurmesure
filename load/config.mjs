export function loadConfig(env = {}) {
  const baseUrl = (env.BASE_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/?#]+(?::\d+)?$/.test(baseUrl)) {
    throw new Error(
      'BASE_URL doit être une origine HTTP(S), sans /v1, identifiants ni paramètres.',
    );
  }
  if (baseUrl.includes('@')) throw new Error('Ne pas inclure de secrets dans BASE_URL.');
  const profile = env.PROFILE || 'load';
  if (!['smoke', 'load'].includes(profile)) throw new Error('PROFILE doit être smoke ou load.');
  const target = Number(env.TARGET_VUS || 500);
  if (!Number.isInteger(target) || target < 500 || target > 5000) {
    throw new Error('TARGET_VUS doit être un entier entre 500 et 5000.');
  }
  const authenticated = Number(env.AUTH_PERCENT || 0);
  if (!Number.isFinite(authenticated) || authenticated < 0 || authenticated > 100) {
    throw new Error('AUTH_PERCENT doit être compris entre 0 et 100.');
  }
  const stages =
    profile === 'smoke'
      ? [
          { duration: '10s', target: 1 },
          { duration: '20s', target: 1 },
          { duration: '5s', target: 0 },
        ]
      : [
          { duration: '1m', target: 50 },
          { duration: '2m', target: 100 },
          { duration: '2m', target: 250 },
          { duration: '2m', target },
          { duration: '5m', target },
          { duration: '1m', target: 0 },
        ];
  return { baseUrl, profile, target, authenticated, stages };
}
