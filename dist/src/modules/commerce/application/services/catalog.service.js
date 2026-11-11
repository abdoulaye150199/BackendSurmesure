"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const commerce_access_service_1 = require("./commerce-access.service");
let CatalogService = class CatalogService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async createEmployeeCatalog(actorId, dto) {
        const employee = await this.access.employeeProfile(actorId);
        return this.db.catalogItem.create({ data: { ...dto, stylistId: employee.stylistId } });
    }
    async listCatalog(limit, cursor) {
        const items = await this.db.catalogItem.findMany({
            where: { active: true, stylist: { user: { is: { active: true, deletedAt: null } } } },
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: { _count: { select: { likes: true } } },
        });
        return items.map(({ _count, ...item }) => ({ ...item, likesCount: _count.likes }));
    }
    async setCatalogLike(id, visitorId, liked) {
        const item = await this.db.catalogItem.findFirst({
            where: { id, active: true },
            select: { id: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('Création introuvable');
        }
        return this.db.$transaction(async (transaction) => {
            if (liked) {
                await transaction.catalogLike.createMany({
                    data: [{ catalogItemId: id, visitorId }],
                    skipDuplicates: true,
                });
            }
            else {
                await transaction.catalogLike.deleteMany({ where: { catalogItemId: id, visitorId } });
            }
            return {
                liked,
                likesCount: await transaction.catalogLike.count({ where: { catalogItemId: id } }),
            };
        });
    }
    getCatalog(id) {
        return this.db.catalogItem.findFirstOrThrow({
            where: { id, active: true, stylist: { user: { is: { active: true, deletedAt: null } } } },
            include: {
                stylist: {
                    include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
                },
            },
        });
    }
    async createCatalog(actorId, dto) {
        const stylist = await this.db.stylistProfile.findUnique({ where: { userId: actorId } });
        if (!stylist) {
            throw new common_1.ForbiddenException();
        }
        return this.db.catalogItem.create({ data: { ...dto, stylistId: stylist.id } });
    }
    async updateCatalog(id, actorId, dto) {
        const item = await this.db.catalogItem.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('Création introuvable');
        }
        if (item.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException('Accès interdit à cette création');
        }
        return this.db.catalogItem.update({ where: { id }, data: dto });
    }
    async deactivateCatalog(id, actorId) {
        const item = await this.db.catalogItem.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('Création introuvable');
        }
        if (item.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException('Accès interdit à cette création');
        }
        await this.db.catalogItem.update({ where: { id }, data: { active: false } });
        return { success: true };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map