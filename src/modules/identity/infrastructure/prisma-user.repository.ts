import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAccount, UserRepository } from '../domain/user.repository';
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaService) {}
  findByEmail(email: string) { return this.db.user.findUnique({ where: { email: email.toLowerCase() } }); }
  findById(id: string) { return this.db.user.findUnique({ where: { id } }); }
  create({ businessName, ...data }: CreateAccount) { return this.db.user.create({ data: {
    ...data, email: data.email.toLowerCase(), stylist: data.role === 'STYLIST' ? { create: { businessName: businessName!, specialties: [] } } : undefined,
  } }); }
  async changePassword(id: string, expectedHash: string, passwordHash: string) {
    const result = await this.db.user.updateMany({ where: { id, passwordHash: expectedHash, active: true, role: 'EMPLOYEE' }, data: { passwordHash, mustChangePassword: false, refreshTokenHash: null } });
    return result.count === 1;
  }
  async setRefreshTokenHash(id: string, refreshTokenHash: string | null) { await this.db.user.update({ where: { id }, data: { refreshTokenHash } }); }
}
