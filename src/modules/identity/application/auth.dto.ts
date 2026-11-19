import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsIn,
  ValidateIf,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';
import { OptionalField, TextField } from '../../../shared/validation/fields';
export class RegisterDto {
  @ApiProperty({ example: 'Fatou', minLength: 2 })
  @TextField(2, 80)
  firstName!: string;
  @ApiProperty({ example: 'Ndiaye', minLength: 2 })
  @TextField(2, 80)
  lastName!: string;
  @ApiProperty({ example: 'fatou@example.com', format: 'email' })
  @TextField(3, 254)
  @IsEmail()
  email!: string;
  @ApiProperty({
    example: '+221 77 000 00 00',
    description: 'Numéro international avec indicatif pays.',
  })
  @IsPhoneNumber()
  phone!: string;
  @ApiProperty({ minLength: 10, format: 'password', writeOnly: true })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;
}
export class StylistRegisterDto {
  @OptionalField() @IsEnum(SubscriptionPlan) requestedPlan?: SubscriptionPlan;
  @ApiProperty({ example: 'Awa', minLength: 2 })
  @TextField(2, 80)
  firstName!: string;
  @ApiProperty({ example: 'Diop', minLength: 2 })
  @TextField(2, 80)
  lastName!: string;
  @ApiProperty({ example: 'Atelier Awa', minLength: 2 })
  @TextField(2, 120)
  businessName!: string;
  @ApiProperty({ example: 'awa@example.com', format: 'email' })
  @TextField(3, 254)
  @IsEmail()
  email!: string;
  @ApiProperty({
    example: '+221 77 000 00 00',
    description: 'Numéro international avec indicatif pays.',
  })
  @IsPhoneNumber()
  phone!: string;
  @ApiProperty({ minLength: 10, format: 'password', writeOnly: true })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;
}
export class LoginDto {
  @TextField(3, 254) @IsEmail() email!: string;
  @IsString() @MinLength(1) @MaxLength(128) password!: string;
}
export class RefreshDto {
  @IsString() @MaxLength(4096) refreshToken!: string;
}

export class GoogleLoginDto {
  @IsString() @MinLength(1) @MaxLength(8192) credential!: string;
}

export class GoogleRegisterDto extends GoogleLoginDto {
  @ValidateIf((dto: GoogleRegisterDto) => dto.role === 'stylist' || dto.requestedPlan !== undefined)
  @OptionalField()
  @IsEnum(SubscriptionPlan)
  requestedPlan?: SubscriptionPlan;
  @IsIn(['client', 'stylist']) role!: 'client' | 'stylist';
  @TextField(2, 80) firstName!: string;
  @TextField(2, 80) lastName!: string;
  @IsPhoneNumber() phone!: string;
  @ValidateIf((dto: GoogleRegisterDto) => dto.role === 'stylist' || dto.businessName !== undefined)
  @TextField(2, 120)
  businessName?: string;
}

export class ChangeEmployeePasswordDto {
  @IsString() @MinLength(1) @MaxLength(128) currentPassword!: string;
  @IsString() @MinLength(10) @MaxLength(128) newPassword!: string;
}
