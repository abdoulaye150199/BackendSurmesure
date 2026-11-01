import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { TextField } from '../../../shared/validation/fields';
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

export class ChangeEmployeePasswordDto {
  @IsString() @MinLength(1) @MaxLength(128) currentPassword!: string;
  @IsString() @MinLength(10) @MaxLength(128) newPassword!: string;
}
