import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateIf } from 'class-validator';
import { AccountRole } from '../domain/account-role';
export class RegisterDto {
  @IsString() @MinLength(2) firstName!: string;
  @IsString() @MinLength(2) lastName!: string;
  @IsEmail() email!: string;
  @IsPhoneNumber() phone!: string;
  @IsString() @MinLength(10) password!: string;
  @IsOptional() @IsEnum(AccountRole) role: AccountRole = AccountRole.CLIENT;
  @ValidateIf((o: RegisterDto) => o.role === AccountRole.STYLIST) @IsString() @MinLength(2) businessName?: string;
}
export class StylistRegisterDto {
  @IsString() @MinLength(2) firstName!: string;
  @IsString() @MinLength(2) lastName!: string;
  @IsEmail() email!: string;
  @IsPhoneNumber() phone!: string;
  @IsString() @MinLength(10) password!: string;
  readonly role = AccountRole.STYLIST;
  @IsString() @MinLength(2) businessName!: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(1) password!: string; }
export class RefreshDto { @IsString() refreshToken!: string; }
