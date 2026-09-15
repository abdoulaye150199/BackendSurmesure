import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { PageQueryDto } from '../../../shared/application/page.dto';
export class OrdersQueryDto extends PageQueryDto { @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus; }
export class MeasurementsQueryDto extends PageQueryDto { @IsOptional() @IsString() q?: string; }
export class CreateOrderDto {
  @IsUUID() clientId!: string; @IsString() clientName!: string; @IsPhoneNumber() clientPhone!: string;
  @IsString() @MinLength(2) description!: string; @Type(() => Number) @IsNumber() @Min(0) totalPrice!: number; @IsOptional() @IsString() notes?: string;
}
export class UpdateOrderDto {
  @IsOptional() @IsString() description?: string; @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalPrice?: number; @IsOptional() @IsString() notes?: string;
}
export class NotifyDto { @IsString() @MinLength(2) message!: string; }
export class CreateMeasurementDto {
  @IsUUID() clientId!: string; @IsString() clientName!: string; @IsPhoneNumber() clientPhone!: string;
  @IsObject() measurements!: Record<string, number>; @IsOptional() @IsString() notes = '';
}
export class UpdateMeasurementDto { @IsOptional() @IsObject() measurements?: Record<string, number>; @IsOptional() @IsString() notes?: string; }
export class SaveClientMeasurementDto {
  @IsUUID() stylistId!: string;
  @IsObject() measurements!: Record<string, number>;
  @IsOptional() @IsString() notes?: string;
}
export class AdminUserStatusDto { @IsBoolean() active!: boolean; }
export class CreatePersonnelDto {
  @IsString() firstName!: string; @IsString() lastName!: string; @IsEmail() email!: string;
  @IsPhoneNumber() phone!: string; @IsString() specialization!: string;
}
export class UpdatePersonnelDto {
  @IsOptional() @IsString() firstName?: string; @IsOptional() @IsString() lastName?: string; @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsPhoneNumber() phone?: string; @IsOptional() @IsString() specialization?: string; @IsOptional() @IsBoolean() active?: boolean;
}
export class CreateCatalogItemDto {
  @IsString() title!: string; @IsOptional() @IsString() description = ''; @IsString() imageUrl!: string;
  @Type(() => Number) @IsNumber() @Min(0) price!: number; @IsOptional() @IsString() currency = 'XOF'; @IsArray() @IsString({ each: true }) availableColors!: string[];
}
export class CreateAppointmentDto { @IsUUID() stylistId!: string; @IsString() service!: string; @IsDateString() startsAt!: string; @IsOptional() @IsString() notes?: string; }
