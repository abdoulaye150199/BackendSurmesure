import { IsBoolean } from 'class-validator';
export class AdminUserStatusDto {
  @IsBoolean() active!: boolean;
}
