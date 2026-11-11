import type { AccountRole } from './account-role';
export declare const USER_REPOSITORY: unique symbol;
export interface AccountRecord {
    id: string;
    role: AccountRole;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    googleSubject?: string | null;
    refreshTokenHash: string | null;
    profileImage: string;
    active: boolean;
    sessionVersion: number;
    mustChangePassword: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type AccessRecord = Pick<AccountRecord, 'id' | 'role' | 'email' | 'active' | 'sessionVersion'>;
export interface CreateAccount {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: AccountRole;
    businessName?: string;
}
export declare class AccountConflictError extends Error {
    constructor();
}
export interface UserRepository {
    findByEmail(email: string): Promise<AccountRecord | null>;
    findById(id: string): Promise<AccountRecord | null>;
    findAccessById(id: string): Promise<AccessRecord | null>;
    create(data: CreateAccount): Promise<AccountRecord>;
    changePassword(id: string, expectedHash: string, passwordHash: string): Promise<boolean>;
    saveRefreshToken(id: string, hash: string, sessionVersion: number, previousHash?: string): Promise<boolean>;
    revokeSessions(id: string): Promise<void>;
}
