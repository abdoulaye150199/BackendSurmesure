import { IsBoolean, IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { OptionalField, TextField } from '../../../../shared/validation/fields';
export class CreateEmployeeAccountDto {
  @TextField(2, 80) firstName!: string;
  @TextField(2, 80) lastName!: string;
  @TextField(3, 254) @IsEmail() email!: string;
  @IsPhoneNumber() phone!: string;
  @IsString() @MinLength(10) @MaxLength(128) password!: string;
  @TextField(2, 120) specialization!: string;
}

export class CreatePersonnelDto {
  @TextField(2, 80) firstName!: string;
  @TextField(2, 80) lastName!: string;
  @TextField(3, 254) @IsEmail() email!: string;
  @IsPhoneNumber() phone!: string;
  @TextField(2, 120) specialization!: string;
}

export class UpdatePersonnelDto {
  @OptionalField() @TextField(2, 80) firstName?: string;
  @OptionalField() @TextField(2, 80) lastName?: string;
  @OptionalField() @TextField(3, 254) @IsEmail() email?: string;
  @OptionalField() @IsPhoneNumber() phone?: string;
  @OptionalField() @TextField(2, 120) specialization?: string;
  @OptionalField() @IsBoolean() active?: boolean;
}

export class EmployeeAccessDto {
  @IsBoolean() active!: boolean;
}
