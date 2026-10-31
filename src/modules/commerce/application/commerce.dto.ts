import { AppointmentStatus, OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PageQueryDto } from '../../../shared/application/page.dto';
export class OrdersQueryDto extends PageQueryDto { @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus; }
export class MeasurementsQueryDto extends PageQueryDto { @IsOptional() @IsString() q?: string; }
export class CreateOrderDto {
  @IsOptional() @IsObject() measurements?: Record<string, number>;
  @IsOptional() @IsInt() @Min(1) @Max(3650) durationDays?: number;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsUUID() clientId?: string; @IsString() @MinLength(2) clientName!: string; @IsPhoneNumber() clientPhone!: string;
  @IsString() @MinLength(2) description!: string; @Type(() => Number) @IsNumber() @Min(0) totalPrice!: number; @IsOptional() @IsString() notes?: string;
}
export class UpdateOrderDto {
  @IsOptional() @IsString() description?: string; @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalPrice?: number; @IsOptional() @IsString() notes?: string;
}
export class NotifyDto { @IsString() @MinLength(2) message!: string; }
export class CreateMeasurementDto {
  @IsOptional() @IsUUID() clientId?: string; @IsString() clientName!: string; @IsPhoneNumber() clientPhone!: string;
  @IsObject() measurements!: Record<string, number>; @IsOptional() @IsString() notes = '';
}
export class CreateEmployeeAccountDto {
  @IsString() @MinLength(2) firstName!: string; @IsString() @MinLength(2) lastName!: string;
  @IsEmail() email!: string; @IsPhoneNumber() phone!: string; @IsString() @MinLength(10) password!: string;
  @IsString() @MinLength(2) specialization!: string;
}
export class CreateEmployeeMeasurementDto {
  @IsString() @MinLength(2) clientName!: string; @IsPhoneNumber() clientPhone!: string;
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
export class EmployeeAccessDto { @IsBoolean() active!: boolean; }
export class CatalogLikeDto {
  @IsUUID() visitorId!: string;
  @IsBoolean() liked!: boolean;
}
export class CreateCatalogItemDto {
  @IsString() title!: string; @IsOptional() @IsString() description = ''; @IsString() imageUrl!: string;
  @Type(() => Number) @IsNumber() @Min(0) price!: number; @IsOptional() @IsString() currency = 'XOF'; @IsArray() @IsString({ each: true }) availableColors!: string[];
}
export class UpdateCatalogItemDto {
  @IsOptional() @IsString() title?: string; @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() currency?: string; @IsOptional() @IsArray() @IsString({ each: true }) availableColors?: string[];
}
export class UpdateStylistProfileDto {
  @IsOptional() @IsString() @MinLength(2) businessName?: string;
  @IsOptional() @IsString() about?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) specialties?: string[];
  @IsOptional() @IsString() @MaxLength(100_000) profileImage?: string;
}
export class UpdateAppointmentStatusDto { @IsEnum(AppointmentStatus) status!: AppointmentStatus; }
export class CreateAppointmentDto { @IsUUID() stylistId!: string; @IsString() service!: string; @IsDateString() startsAt!: string; @IsOptional() @IsString() notes?: string; }
