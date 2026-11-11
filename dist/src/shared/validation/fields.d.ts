import { type ValidationOptions } from 'class-validator';
export declare function OptionalField(): PropertyDecorator;
export declare function TextField(min?: number, max?: number): PropertyDecorator;
export declare function NumericField(): PropertyDecorator;
export declare function IsImageLocation(allowEmpty?: boolean, options?: ValidationOptions): PropertyDecorator;
export declare function validImageLocation(value: unknown, allowEmpty?: boolean): boolean;
