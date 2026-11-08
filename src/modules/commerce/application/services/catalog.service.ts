import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from '../commerce.dto';

import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}
  async createEmployeeCatalog(actorId: string, dto: CreateCatalogItemDto) {
    const employee = await this.access.employeeProfile(actorId);
    return this.db.catalogItem.create({ data: { ...dto, stylistId: employee.stylistId } });
  }

  async listCatalog(limit: number, cursor?: string) {
    const items = await this.db.catalogItem.findMany({
      where: { active: true, stylist: { user: { is: { active: true, deletedAt: null } } } },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { _count: { select: { likes: true } } },
    });
    return items.map(({ _count, ...item }) => ({ ...item, likesCount: _count.likes }));
  }

  async setCatalogLike(id: string, visitorId: string, liked: boolean) {
    const item = await this.db.catalogItem.findFirst({
      where: { id, active: true },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException('Création introuvable');
    }
    return this.db.$transaction(async (transaction) => {
      if (liked) {
        await transaction.catalogLike.createMany({
          data: [{ catalogItemId: id, visitorId }],
          skipDuplicates: true,
        });
      } else {
        await transaction.catalogLike.deleteMany({ where: { catalogItemId: id, visitorId } });
      }
      return {
        liked,
        likesCount: await transaction.catalogLike.count({ where: { catalogItemId: id } }),
      };
    });
  }

  getCatalog(id: string) {
    return this.db.catalogItem.findFirstOrThrow({
      where: { id, active: true, stylist: { user: { is: { active: true, deletedAt: null } } } },
      include: {
        stylist: {
          include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
        },
      },
    });
  }

  async createCatalog(actorId: string, dto: CreateCatalogItemDto) {
    const stylist = await this.db.stylistProfile.findUnique({ where: { userId: actorId } });
    if (!stylist) {
      throw new ForbiddenException();
    }
    return this.db.catalogItem.create({ data: { ...dto, stylistId: stylist.id } });
  }

  async updateCatalog(id: string, actorId: string, dto: UpdateCatalogItemDto) {
    const item = await this.db.catalogItem.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!item) {
      throw new NotFoundException('Création introuvable');
    }
    if (item.stylist.userId !== actorId) {
      throw new ForbiddenException('Accès interdit à cette création');
    }
    return this.db.catalogItem.update({ where: { id }, data: dto });
  }

  async deactivateCatalog(id: string, actorId: string) {
    const item = await this.db.catalogItem.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!item) {
      throw new NotFoundException('Création introuvable');
    }
    if (item.stylist.userId !== actorId) {
      throw new ForbiddenException('Accès interdit à cette création');
    }
    await this.db.catalogItem.update({ where: { id }, data: { active: false } });
    return { success: true };
  }
}
