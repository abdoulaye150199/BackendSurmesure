import { IsBoolean, IsEnum, IsIn, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApprovalStatus, SubscriptionPlan } from '@prisma/client';
import { Type } from 'class-transformer';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { OptionalField } from '../../../../shared/validation/fields';
export class AdminUserStatusDto {
  @IsBoolean() active!: boolean;
}

export class AdminApproveUserDto {
  @IsEnum(SubscriptionPlan) subscriptionPlan!: SubscriptionPlan;
}

export class AdminUsersQueryDto extends PageQueryDto {
  @OptionalField() @IsEnum(ApprovalStatus) approvalStatus?: ApprovalStatus;
  @OptionalField() @Type(() => Number) @IsInt() @Min(1) @Max(1000000) page?: number;
  @OptionalField() @IsString() @MaxLength(160) search?: string;
  @OptionalField() @IsIn(['CLIENT', 'STYLIST', 'EMPLOYEE', 'ADMIN']) role?:
    'CLIENT' | 'STYLIST' | 'EMPLOYEE' | 'ADMIN';
}
