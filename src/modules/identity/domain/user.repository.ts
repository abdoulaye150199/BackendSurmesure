import { AccountRole } from './account-role';
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export interface AccountRecord {
  id: string;
  role: AccountRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  profileImage: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type PublicUser = Omit<AccountRecord, 'passwordHash' | 'refreshTokenHash'>;
export interface CreateAccount { firstName: string; lastName: string; email: string; phone: string; passwordHash: string; role: AccountRole; businessName?: string }
export interface UserRepository {
  findByEmail(email: string): Promise<AccountRecord | null>;
  findById(id: string): Promise<AccountRecord | null>;
  create(data: CreateAccount): Promise<AccountRecord>;
  setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
}
