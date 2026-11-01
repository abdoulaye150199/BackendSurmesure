import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { OptionalField } from '../validation/fields';
export class PageQueryDto {
  @OptionalField() @IsUUID() cursor?: string;
  @OptionalField() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
export interface CursorPage<T> {
  data: T[];
  meta: { nextCursor: string | null; hasMore: boolean };
}
