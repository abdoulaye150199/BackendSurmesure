import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  AccountConflictError,
  type CreateAccount,
  type UserRepository,
} from '../domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaService) {}
  findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email: email.trim().toLowerCase(), deletedAt: null },
    });
  }
  findById(id: string) {
    return this.db.user.findUnique({ where: { id, deletedAt: null } });
  }
  findAccessById(id: string) {
    return this.db.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, role: true, email: true, active: true, sessionVersion: true },
    });
  }
  async create({ businessName, ...data }: CreateAccount) {
    try {
      return await this.db.user.create({
        data: {
          ...data,
          email: data.email.trim().toLowerCase(),
          stylist:
            data.role === 'STYLIST'
              ? { create: { businessName: businessName!, specialties: [] } }
              : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AccountConflictError();
      }
      throw error;
    }
  }
  async changePassword(id: string, expectedHash: string, passwordHash: string) {
    const result = await this.db.user.updateMany({
      where: { id, passwordHash: expectedHash, active: true, role: 'EMPLOYEE' },
      data: {
        passwordHash,
        mustChangePassword: false,
        refreshTokenHash: null,
        sessionVersion: { increment: 1 },
      },
    });
    return result.count === 1;
  }
  async saveRefreshToken(
    id: string,
    refreshTokenHash: string,
    sessionVersion: number,
    previousHash?: string,
  ) {
    const result = await this.db.user.updateMany({
      where: {
        id,
        active: true,
        sessionVersion,
        ...(previousHash !== undefined && { refreshTokenHash: previousHash }),
      },
      data: { refreshTokenHash },
    });
    return result.count === 1;
  }
  async revokeSessions(id: string) {
    await this.db.user.updateMany({
      where: { id },
      data: { refreshTokenHash: null, sessionVersion: { increment: 1 } },
    });
  }
}
