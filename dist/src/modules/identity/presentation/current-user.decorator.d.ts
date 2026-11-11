import type { AccountRole } from '../domain/account-role';
export interface AuthUser {
    sub: string;
    role: AccountRole;
    email: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
