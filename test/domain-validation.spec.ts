import {
  assertAppointmentTransition,
  type AppointmentStatus,
} from '../src/modules/commerce/domain/appointment';
import { assertMeasurements } from '../src/modules/commerce/domain/measurements';
import { tokenDurationSeconds } from '../src/modules/identity/domain/token-duration';
import { paginate } from '../src/shared/application/pagination';
import { validImageLocation } from '../src/shared/validation/fields';

describe('measurement input contracts', () => {
  it.each([
    undefined,
    null,
    [],
    true,
    {},
    { taille: 0 },
    { taille: -1 },
    { taille: 301 },
    { taille: '74' },
    { taille: true },
    { taille: NaN },
    { taille: Infinity },
    { ' ': 74 },
    { ['x'.repeat(81)]: 74 },
    Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`mesure${i}`, 1])),
  ])('rejects malformed measurements %#', (input) => {
    expect(() => assertMeasurements(input)).toThrow();
  });
  it('accepts valid boundary measurements without coercing their values', () => {
    const input = { taille: 0.1, hauteur: 300 };
    expect(() => assertMeasurements(input)).not.toThrow();
    expect(input).toEqual({ taille: 0.1, hauteur: 300 });
  });
});
describe('token TTL configuration', () => {
  it.each([
    ['1s', 1],
    ['15m', 900],
    ['2h', 7200],
    ['30d', 2592000],
  ])('parses %s', (input, seconds) => {
    expect(tokenDurationSeconds(input)).toBe(seconds);
  });
  it.each(['', '15', '0s', '-1m', '1.5h', '366d', '99999999999999999999d'])(
    'rejects unsafe duration %s',
    (input) => {
      expect(() => tokenDurationSeconds(input)).toThrow();
    },
  );
});
describe('appointment lifecycle', () => {
  const states: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
  it.each(states)('accepts repeating the current %s state', (state) => {
    expect(() => assertAppointmentTransition(state, state)).not.toThrow();
  });
  it.each(['completed', 'cancelled'] as const)(
    'does not reopen a terminal %s appointment',
    (state) => {
      expect(() => assertAppointmentTransition(state, 'pending')).toThrow();
    },
  );
});
describe('safe image locations', () => {
  it.each([
    'https://example.com/photo.jpg',
    'http://localhost/photo.webp',
    '/assets/look-1.png',
    'data:image/png;base64,YQ==',
  ])('accepts %s', (input) => {
    expect(validImageLocation(input)).toBe(true);
  });
  it.each([
    null,
    false,
    '',
    'a'.repeat(100001),
    '/assets/../secret',
    'javascript:alert(1)',
    'data:image/svg+xml;base64,YQ==',
    'https://user:password@example.com/a',
    'not a url',
  ])('rejects invalid image %#', (input) => {
    expect(validImageLocation(input)).toBe(false);
  });
  it('allows an empty portrait only when explicitly requested', () => {
    expect(validImageLocation('', true)).toBe(true);
  });
});
describe('cursor pages', () => {
  it('does not mutate rows while removing the lookahead item', () => {
    const rows = [{ id: 'first' }, { id: 'second' }];
    expect(paginate(rows, 1)).toEqual({
      data: [{ id: 'first' }],
      meta: { hasMore: true, nextCursor: 'first' },
    });
    expect(rows).toHaveLength(2);
  });
  it('returns an empty terminal page', () => {
    expect(paginate([], 20)).toEqual({ data: [], meta: { hasMore: false, nextCursor: null } });
  });
});
