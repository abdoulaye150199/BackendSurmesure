import { OrderStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsPhoneNumber,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { NumericField, OptionalField, TextField } from '../../../../shared/validation/fields';
export class OrdersQueryDto extends PageQueryDto {
  @OptionalField() @IsEnum(OrderStatus) status?: OrderStatus;
}

export class CreateOrderDto {
  @OptionalField() @IsObject() measurements?: Record<string, number>;
  @OptionalField() @IsInt() @Min(1) @Max(3650) durationDays?: number;
  @OptionalField() @IsDateString() dueAt?: string;
  @OptionalField() @IsUUID() clientId?: string;
  @TextField(2) clientName!: string;
  @IsPhoneNumber() clientPhone!: string;
  @TextField(2, 1000) description!: string;
  @NumericField()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  totalPrice!: number;
  @OptionalField() @TextField(0, 1000) notes?: string;
}

export class UpdateOrderDto {
  @OptionalField() @TextField(2, 1000) description?: string;
  @OptionalField() @IsEnum(OrderStatus) status?: OrderStatus;
  @OptionalField()
  @NumericField()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  totalPrice?: number;
  @OptionalField() @TextField(0, 1000) notes?: string;
}

export class NotifyDto {
  @TextField(2, 1000) message!: string;
}
