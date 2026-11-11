import type { AccountRole } from '../domain/account-role';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: AccountRole[]) => import("@nestjs/common").CustomDecorator<string>;
