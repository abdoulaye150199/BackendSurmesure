import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountRole } from '../domain/account-role';
export interface AuthUser { sub: string; role: AccountRole; email: string }
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user);
