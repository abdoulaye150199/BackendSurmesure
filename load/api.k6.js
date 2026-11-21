import http from 'k6/http';
import { check, sleep } from 'k6';
import execution from 'k6/execution';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { loadConfig } from './config.mjs';

const config = loadConfig(__ENV);
const rateLimited = new Rate('rate_limited');
const serverErrors = new Rate('server_errors');
const invalidResponses = new Rate('invalid_responses');
const plateauLatency = new Trend('plateau_latency', true);
const plateauErrors = new Rate('plateau_errors');
const tokens = new SharedArray('load-test-tokens', () => {
  if (!__ENV.TOKENS_FILE) return [];
  const values = JSON.parse(open(__ENV.TOKENS_FILE));
  if (!Array.isArray(values) || values.some((value) => typeof value !== 'string' || !value)) {
    throw new Error('TOKENS_FILE doit contenir un tableau JSON de jetons d’accès de test.');
  }
  if (new Set(values).size !== values.length) {
    throw new Error('Les jetons de test doivent être distincts.');
  }
  return values;
});
if (config.authenticated > 0 && tokens.length < (config.profile === 'smoke' ? 1 : config.target)) {
  throw new Error('Fournir un jeton de compte client de test distinct par utilisateur virtuel.');
}

export const options = {
  scenarios: {
    visitors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: config.stages,
      gracefulRampDown: '15s',
      gracefulStop: '20s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    checks: ['rate>0.99'],
    rate_limited: [{ threshold: 'rate<0.01', abortOnFail: true, delayAbortEval: '30s' }],
    invalid_responses: ['rate<0.01'],
    server_errors: [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '30s' }],
    ...(config.profile === 'load'
      ? {
          plateau_latency: ['p(95)<1500', 'p(99)<3000'],
          plateau_errors: ['rate<0.01'],
        }
      : {}),
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)'],
  // Never put credentials or personal response bodies in the reports.
  systemTags: ['status', 'method', 'name', 'scenario', 'expected_response'],
};

function request(path, name, validate, token) {
  const response = http.get(`${config.baseUrl}/v1${path}`, {
    tags: { name },
    timeout: '10s',
    redirects: 0,
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return recordResponse(response, name, validate, 200);
}

function recordResponse(response, name, validate, status) {
  let body;
  let valid = false;
  try {
    body = response.json();
    valid = response.status === status && validate(body);
  } catch {
    /* Invalid JSON is a failure. */
  }
  check(response, { [`${name}: HTTP ${status} et réponse valide`]: () => valid });
  rateLimited.add(response.status === 429);
  serverErrors.add(response.status === 0 || response.status >= 500);
  invalidResponses.add(!valid);
  const elapsed = Date.now() - execution.scenario.startTime;
  if (config.profile === 'load' && elapsed >= 420000 && elapsed < 720000) {
    plateauLatency.add(response.timings.duration);
    plateauErrors.add(!valid);
  }
  return valid ? body : null;
}

export function setup() {
  const response = http.get(`${config.baseUrl}/v1/health/ready`, {
    timeout: '10s',
    tags: { name: 'readiness' },
  });
  if (response.status !== 200) throw new Error('API non prête : arrêt avant la montée en charge.');
  return { slotStart: Date.now() + 7 * 24 * 3600_000 };
}

let appointmentAttempted = false;

export default function ({ slotStart }) {
  const items = request('/catalog?limit=13', 'catalog', Array.isArray);
  sleep(1 + Math.random() * 2);
  request('/stylists?limit=21', 'stylists', Array.isArray);
  if (items?.length) {
    const item = items[Math.floor(Math.random() * items.length)];
    if (typeof item.id === 'string') {
      sleep(1 + Math.random() * 2);
      request(
        `/catalog/${encodeURIComponent(item.id)}`,
        'model_detail',
        (body) => body?.id === item.id,
      );
    }
  }
  if ((execution.vu.idInTest - 1) % 100 < config.authenticated) {
    const token = tokens[execution.vu.idInTest - 1];
    request(
      '/auth/me',
      'client_profile',
      (body) => typeof body?.id === 'string' && body.role === 'CLIENT',
      token,
    );
    const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
    const reads = [
      ['/orders?limit=100', 'client_orders', body => Array.isArray(body?.data)],
      ['/measurements', 'client_measurements', Array.isArray],
      ['/appointments', 'client_appointments', Array.isArray],
    ];
    const responses = http.batch(reads.map(([path, name]) => ({
      method: 'GET', url: `${config.baseUrl}/v1${path}`, params: { headers, tags: { name }, timeout: '10s', redirects: 0 },
    })));
    reads.forEach(([, name, validate], index) => recordResponse(responses[index], name, validate, 200));
    const atPlateau = Date.now() - execution.scenario.startTime >= 420000;
    if (config.appointmentStylist && !appointmentAttempted && (config.profile === 'smoke' || atPlateau)) {
      appointmentAttempted = true;
      const response = http.post(`${config.baseUrl}/v1/appointments`, JSON.stringify({
        stylistId: config.appointmentStylist,
        startsAt: new Date(slotStart + execution.vu.idInTest * 60000).toISOString(),
        service: 'Essayage de test k6',
      }), { headers: { ...headers, 'Content-Type': 'application/json' }, tags: { name: 'request_appointment' }, timeout: '10s', redirects: 0 });
      recordResponse(response, 'request_appointment', body => typeof body?.id === 'string' && body.status === 'pending', 201);
    }
  }
  sleep(2 + Math.random() * 3);
}

export function handleSummary(data) {
  const metric = (name, field) => data.metrics[name]?.values?.[field] ?? 'n/a';
  const failed = Object.entries(data.metrics).flatMap(([name, value]) =>
    Object.entries(value.thresholds || {})
      .filter(([, result]) => !result.ok)
      .map(([threshold]) => `${name}: ${threshold}`),
  );
  return {
    [__ENV.SUMMARY_FILE || 'load-results/summary.json']: JSON.stringify(
      {
        targetVUs: config.profile === 'smoke' ? 1 : config.target,
        profile: config.profile,
        baseUrl: config.baseUrl,
        authenticatedPercent: config.authenticated,
        ...data,
      },
      null,
      2,
    ),
    stdout: `\nProfil : ${config.profile}\nRequêtes : ${metric('http_reqs', 'count')}\nErreurs HTTP : ${metric('http_req_failed', 'rate')}\np95 : ${metric('http_req_duration', 'p(95)')} ms\np99 : ${metric('http_req_duration', 'p(99)')} ms\nSeuils échoués : ${failed.length ? failed.join('; ') : 'aucun'}\nRapport : ${__ENV.SUMMARY_FILE || 'load-results/summary.json'}\n`,
  };
}
