import { BadRequestException } from '@nestjs/common';
import { DomainError } from '../../../shared/domain/domain-error';
import { assertMeasurements } from '../domain/measurements';
export function validateMeasurements(value: unknown): asserts value is Record<string, number> {
  try {
    assertMeasurements(value);
  } catch (error) {
    if (error instanceof DomainError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
