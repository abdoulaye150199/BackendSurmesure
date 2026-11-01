import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  IsImageLocation,
  NumericField,
  OptionalField,
  TextField,
} from '../../../../shared/validation/fields';
export class CatalogLikeDto {
  @IsUUID() visitorId!: string;
  @IsBoolean() liked!: boolean;
}

export class CreateCatalogItemDto {
  @TextField(2, 100) title!: string;
  @OptionalField() @TextField(0, 1000) description = '';
  @IsImageLocation() imageUrl!: string;
  @NumericField() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999999999.99) price!: number;
  @OptionalField() @IsIn(['XOF', 'EUR', 'USD']) currency = 'XOF';
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(40, { each: true })
  availableColors!: string[];
}

export class UpdateCatalogItemDto {
  @OptionalField() @TextField(2, 100) title?: string;
  @OptionalField() @TextField(0, 1000) description?: string;
  @OptionalField() @IsImageLocation() imageUrl?: string;
  @OptionalField()
  @NumericField()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  price?: number;
  @OptionalField() @IsIn(['XOF', 'EUR', 'USD']) currency?: string;
  @OptionalField()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(40, { each: true })
  availableColors?: string[];
}

export class UpdateStylistProfileDto {
  @OptionalField() @TextField(2, 120) businessName?: string;
  @OptionalField() @TextField(0, 1000) about?: string;
  @OptionalField()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  specialties?: string[];
  @OptionalField() @IsImageLocation(true) profileImage?: string;
}
