import { DomainError } from '../../../shared/domain/domain-error';

export const MAX_MEASUREMENTS = 50;
export const MAX_MEASUREMENT_CM = 300;

export function assertMeasurements(values: unknown): asserts values is Record<string, number> {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new DomainError(
      'Les mensurations doivent être un objet de mesures numériques.',
      'MEASUREMENTS_INVALID',
    );
  }
  const entries = Object.entries(values);
  if (
    !entries.length ||
    entries.length > MAX_MEASUREMENTS ||
    entries.some(
      ([key, value]) =>
        !key.trim() ||
        ['__proto__', 'constructor', 'prototype'].includes(key) ||
        key.length > 80 ||
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value <= 0 ||
        value > MAX_MEASUREMENT_CM,
    )
  ) {
    throw new DomainError(
      'Renseignez de 1 à 50 mesures numériques entre 0 et 300 cm (zéro exclu).',
      'MEASUREMENTS_INVALID',
    );
  }
}
