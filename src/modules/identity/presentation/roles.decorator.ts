import { SetMetadata } from '@nestjs/common';
import type { AccountRole } from '../domain/account-role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AccountRole[]) => SetMetadata(ROLES_KEY, roles);
