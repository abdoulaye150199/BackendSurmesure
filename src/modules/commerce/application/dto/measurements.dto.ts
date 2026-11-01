import { IsDateString, IsObject, IsPhoneNumber, IsUUID } from 'class-validator';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { OptionalField, TextField } from '../../../../shared/validation/fields';
export class MeasurementsQueryDto extends PageQueryDto {
  @OptionalField() @TextField(1, 160) q?: string;
}

export class CreateMeasurementDto {
  @OptionalField() @IsUUID() clientId?: string;
  @TextField(2) clientName!: string;
  @IsPhoneNumber() clientPhone!: string;
  @IsObject() measurements!: Record<string, number>;
  @OptionalField() @TextField(0, 1000) notes = '';
}

export class CreateEmployeeMeasurementDto {
  @TextField(2) clientName!: string;
  @IsPhoneNumber() clientPhone!: string;
  @IsObject() measurements!: Record<string, number>;
  @OptionalField() @TextField(0, 1000) notes = '';
}

export class UpdateMeasurementDto {
  @OptionalField() @IsObject() measurements?: Record<string, number>;
  @OptionalField() @TextField(0, 1000) notes?: string;
}

export class ValidateMeasurementDto {
  @TextField(2, 120) modelName!: string;
  @IsDateString() expectedUpdatedAt!: string;
}

export class SaveClientMeasurementDto {
  @OptionalField() @IsUUID() measurementId?: string;
  @IsUUID() stylistId!: string;
  @IsObject() measurements!: Record<string, number>;
  @OptionalField() @TextField(0, 1000) notes?: string;
}

export class CreateClientModelMeasurementDto {
  @OptionalField() @TextField(0, 120) modelType?: string;
  @IsUUID() stylistId!: string;
  @TextField(2, 120) modelName!: string;
  @IsObject() measurements!: Record<string, number>;
  @OptionalField() @TextField(0, 1000) notes?: string;
}
