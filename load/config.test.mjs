import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from './config.mjs';

test('default test reaches and sustains 500 VUs for five minutes', () => {
  const config = loadConfig();
  assert.equal(config.baseUrl, 'http://127.0.0.1:3001');
  assert.deepEqual(
    config.stages.map((stage) => stage.target),
    [50, 100, 250, 500, 500, 0],
  );
  assert.deepEqual(config.stages[4], { duration: '5m', target: 500 });
});
test('smoke test runs only one virtual user', () => {
  assert.equal(
    Math.max(...loadConfig({ PROFILE: 'smoke' }).stages.map((stage) => stage.target)),
    1,
  );
});
test('load target cannot silently fall below 500', () => {
  for (const value of ['0', '499', 'abc', '500.5', '5001']) {
    assert.throws(() => loadConfig({ TARGET_VUS: value }));
  }
  assert.equal(loadConfig({ TARGET_VUS: '750' }).stages[4].target, 750);
});
test('rejects secrets, API paths and non-HTTP targets', () => {
  for (const value of [
    'https://user:secret@example.com',
    'https://example.com/v1',
    'file:///tmp/x',
    'https://example.com?secret=x',
  ]) {
    assert.throws(() => loadConfig({ BASE_URL: value }));
  }
});
test('validates scenario selection and authenticated percentage', () => {
  assert.throws(() => loadConfig({ PROFILE: 'typo' }));
  for (const value of ['-1', '101', 'NaN'])
    assert.throws(() => loadConfig({ AUTH_PERCENT: value }));
  assert.equal(loadConfig({ AUTH_PERCENT: '20' }).authenticated, 20);
});

test('supports 1000 and 1500 active visitors and opt-in appointment requests', () => {
  for (const target of [1000, 1500]) {
    const config = loadConfig({TARGET_VUS: String(target)});
    assert.deepEqual(config.stages[4], {duration: '5m', target});
    assert.equal(config.appointmentStylist, '');
  }
  const id = '00000000-0000-4000-8000-000000000001';
  assert.throws(() => loadConfig({APPOINTMENT_STYLIST_ID: id}));
  assert.throws(() => loadConfig({APPOINTMENT_STYLIST_ID: 'bad', AUTH_PERCENT:'100'}));
  assert.equal(loadConfig({AUTH_PERCENT:'100', APPOINTMENT_STYLIST_ID: id}).appointmentStylist, id);
});
