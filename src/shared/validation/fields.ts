import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

/** Optional means absent, not null: null must still pass the field's validators. */
export function OptionalField(): PropertyDecorator {
  return ValidateIf((_object, value: unknown) => value !== undefined);
}
export function TextField(min = 1, max = 160): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() : value,
    ),
    IsString(),
    MinLength(min),
    MaxLength(max),
  );
}
export function NumericField(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() ? Number(value) : value,
  );
}
export function IsImageLocation(
  allowEmpty = false,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) =>
    registerDecorator({
      name: 'isImageLocation',
      target: target.constructor,
      propertyName: String(propertyKey),
      options,
      validator: {
        validate: (value: unknown) => validImageLocation(value, allowEmpty),
        defaultMessage: () =>
          'Image invalide : utilisez une URL HTTP(S), un fichier PNG, JPEG ou WebP encodé, ou un chemin /assets/.',
      },
    });
}
export function validImageLocation(value: unknown, allowEmpty = false): boolean {
  if (typeof value !== 'string' || value.length > 100_000) {
    return false;
  }
  if (!value) {
    return allowEmpty;
  }
  if (/^\/assets\/[a-z\d_./-]+$/i.test(value) && !value.includes('..')) {
    return true;
  }
  if (/^data:image\/(png|jpeg|webp);base64,[a-z\d+/]+={0,2}$/i.test(value)) {
    return true;
  }
  try {
    const url = new URL(value);
    return (
      ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password
    );
  } catch {
    return false;
  }
}
