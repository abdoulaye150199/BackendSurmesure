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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
let ProfilesService = class ProfilesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async updateStylistProfile(actorId, dto) {
        const profile = await this.db.stylistProfile.findUnique({ where: { userId: actorId } });
        if (!profile) {
            throw new common_1.NotFoundException('Profil styliste introuvable');
        }
        const { profileImage, ...profileData } = dto;
        return this.db.stylistProfile.update({
            where: { id: profile.id },
            data: {
                ...profileData,
                ...(profileImage !== undefined ? { user: { update: { profileImage } } } : {}),
            },
            include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
        });
    }
    listStylists(limit, cursor) {
        return this.db.stylistProfile.findMany({
            where: { user: { is: { active: true, deletedAt: null } } },
            take: limit,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: [{ rating: 'desc' }, { id: 'asc' }],
            include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
        });
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map