import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { AccountRole } from '../domain/account-role';
export class RegisterDto {
  @ApiProperty({ example: 'Fatou', minLength: 2 })
  @IsString() @MinLength(2) firstName!: string;
  @ApiProperty({ example: 'Ndiaye', minLength: 2 })
  @IsString() @MinLength(2) lastName!: string;
  @ApiProperty({ example: 'fatou@example.com', format: 'email' })
  @IsEmail() email!: string;
  @ApiProperty({ example: '+221 77 000 00 00', description: 'Numéro international avec indicatif pays.' })
  @IsPhoneNumber() phone!: string;
  @ApiProperty({ minLength: 10, format: 'password', writeOnly: true })
  @IsString() @MinLength(10) password!: string;
}
export class StylistRegisterDto {
  @ApiProperty({ example: 'Awa', minLength: 2 })
  @IsString() @MinLength(2) firstName!: string;
  @ApiProperty({ example: 'Diop', minLength: 2 })
  @IsString() @MinLength(2) lastName!: string;
  @ApiProperty({ example: 'Atelier Awa', minLength: 2 })
  @IsString() @MinLength(2) businessName!: string;
  @ApiProperty({ example: 'awa@example.com', format: 'email' })
  @IsEmail() email!: string;
  @ApiProperty({ example: '+221 77 000 00 00', description: 'Numéro international avec indicatif pays.' })
  @IsPhoneNumber() phone!: string;
  @ApiProperty({ minLength: 10, format: 'password', writeOnly: true })
  @IsString() @MinLength(10) password!: string;
  @ApiHideProperty()
  @IsEnum(AccountRole) readonly role = AccountRole.STYLIST;
}
export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(1) password!: string; }
export class RefreshDto { @IsString() refreshToken!: string; }
