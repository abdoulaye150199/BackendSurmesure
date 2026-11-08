import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { canonicalPhone } from '../../../../shared/domain/contact';
import type {
  CreateEmployeeAccountDto,
  CreatePersonnelDto,
  UpdatePersonnelDto,
} from '../commerce.dto';

import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class TeamService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}
  async listPersonnel(routeId: string, actorId: string) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    return this.db.personnel.findMany({
      where: { stylistId: stylist.id },
      include: { user: { select: { id: true, email: true, active: true } } },
      orderBy: { hireDate: 'desc' },
    });
  }

  async createEmployeeAccount(routeId: string, actorId: string, dto: CreateEmployeeAccountDto) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const passwordHash = await argon2.hash(dto.password);
    try {
      return await this.db.$transaction(async (transaction) => {
        const user = await transaction.user.create({
          data: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: dto.email.toLowerCase(),
            phone: canonicalPhone(dto.phone),
            passwordHash,
            role: UserRole.EMPLOYEE,
            mustChangePassword: true,
          },
        });
        return transaction.personnel.create({
          data: {
            stylistId: stylist.id,
            userId: user.id,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: dto.email.toLowerCase(),
            phone: canonicalPhone(dto.phone),
            specialization: dto.specialization.trim(),
          },
          include: { user: { select: { id: true, email: true, active: true } } },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Cet e-mail ou ce numéro est déjà utilisé par un compte.');
      }
      throw error;
    }
  }

  async setEmployeeAccess(routeId: string, personnelId: string, actorId: string, active: boolean) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const person = await this.db.personnel.findFirst({
      where: { id: personnelId, stylistId: stylist.id },
    });
    if (!person) {
      throw new NotFoundException('Employé introuvable');
    }
    await this.db.$transaction([
      this.db.personnel.update({ where: { id: person.id }, data: { active } }),
      ...(person.userId
        ? [
            this.db.user.update({
              where: { id: person.userId, deletedAt: null },
              data: {
                active,
                ...(!active && { refreshTokenHash: null, sessionVersion: { increment: 1 } }),
              },
            }),
          ]
        : []),
    ]);
    return { success: true, active };
  }

  async removeEmployee(routeId: string, personnelId: string, actorId: string) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const person = await this.db.personnel.findFirst({
      where: { id: personnelId, stylistId: stylist.id },
    });
    if (!person) {
      throw new NotFoundException('Employé introuvable');
    }
    await this.db.$transaction(async (transaction) => {
      if (person.userId) {
        await transaction.user.update({
          where: { id: person.userId },
          data: { active: false, refreshTokenHash: null, sessionVersion: { increment: 1 } },
        });
      }
      await transaction.personnel.delete({ where: { id: person.id } });
    });
    return { success: true };
  }

  async createPersonnel(routeId: string, actorId: string, dto: CreatePersonnelDto) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    return this.db.personnel.create({ data: { ...dto, stylistId: stylist.id } });
  }

  async updatePersonnel(routeId: string, id: string, actorId: string, dto: UpdatePersonnelDto) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const person = await this.db.personnel.findFirst({ where: { id, stylistId: stylist.id } });
    if (!person) {
      throw new NotFoundException('Employé introuvable');
    }
    const data = {
      ...dto,
      email: dto.email?.trim().toLowerCase(),
      phone: dto.phone ? canonicalPhone(dto.phone) : undefined,
    };
    return this.db.$transaction(async (transaction) => {
      if (person.userId) {
        const { specialization: _specialization, ...userData } = data;
        await transaction.user.update({
          where: { id: person.userId, deletedAt: null },
          data: {
            ...userData,
            ...(dto.active === false && {
              refreshTokenHash: null,
              sessionVersion: { increment: 1 },
            }),
          },
        });
      }
      return transaction.personnel.update({ where: { id }, data });
    });
  }
  async deletePersonnel(id: string, actorId: string) {
    const person = await this.db.personnel.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!person) {
      throw new NotFoundException('Employé introuvable');
    }
    if (person.stylist.userId !== actorId) {
      throw new ForbiddenException();
    }
    return this.removeEmployee(person.stylistId, id, actorId);
  }
}
