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
exports.CommerceAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const contact_1 = require("../../../../shared/domain/contact");
let CommerceAccessService = class CommerceAccessService {
    db;
    constructor(db) {
        this.db = db;
    }
    async stylistProfile(routeId, actorId) {
        const profile = await this.db.stylistProfile.findFirst({
            where: { OR: [{ id: routeId }, { userId: routeId }] },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Styliste introuvable');
        }
        if (profile.userId !== actorId) {
            throw new common_1.ForbiddenException('Accès interdit à cet atelier');
        }
        return profile;
    }
    async employeeProfile(actorId) {
        const person = await this.db.personnel.findFirst({
            where: {
                userId: actorId,
                active: true,
                user: { is: { active: true, role: client_1.UserRole.EMPLOYEE } },
            },
            include: { stylist: { select: { id: true, businessName: true } } },
        });
        if (!person) {
            throw new common_1.ForbiddenException('Accès employé désactivé ou introuvable');
        }
        return person;
    }
    async assertClientPhone(clientId, phone) {
        const client = await this.db.user.findFirst({
            where: { id: clientId, active: true, role: client_1.UserRole.CLIENT },
            select: { phone: true },
        });
        if (!client || (0, contact_1.canonicalPhone)(client.phone) !== (0, contact_1.canonicalPhone)(phone)) {
            throw new common_1.BadRequestException('Le compte client ne correspond pas au téléphone indiqué.');
        }
    }
};
exports.CommerceAccessService = CommerceAccessService;
exports.CommerceAccessService = CommerceAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommerceAccessService);
//# sourceMappingURL=commerce-access.service.js.map