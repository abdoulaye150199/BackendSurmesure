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
  async setRefreshTokenHash(id: string, refreshTokenHash: string | null) { await this.db.user.update({ where: { id }, data: { refreshTokenHash } }); }
}
