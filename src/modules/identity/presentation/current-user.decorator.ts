import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { AccountRole } from '../domain/account-role';
import type { SubscriptionPlan } from '@prisma/client';
export interface AuthUser {
  sub: string;
  role: AccountRole;
  email: string;
  subscriptionPlan?: SubscriptionPlan | null;
}
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
