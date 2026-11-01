import { AppointmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { OptionalField, TextField } from '../../../../shared/validation/fields';
export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus) status!: AppointmentStatus;
}

export class CreateAppointmentDto {
  @IsUUID() stylistId!: string;
  @TextField(2, 160) service!: string;
  @IsDateString() startsAt!: string;
  @OptionalField() @TextField(0, 1000) notes?: string;
}
