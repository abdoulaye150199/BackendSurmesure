"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const contact_1 = require("../../../../shared/domain/contact");
const commerce_access_service_1 = require("./commerce-access.service");
let TeamService = class TeamService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async listPersonnel(routeId, actorId) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        return this.db.personnel.findMany({
            where: { stylistId: stylist.id },
            include: { user: { select: { id: true, email: true, active: true } } },
            orderBy: { hireDate: 'desc' },
        });
    }
    async createEmployeeAccount(routeId, actorId, dto) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const passwordHash = await argon2.hash(dto.password);
        try {
            return await this.db.$transaction(async (transaction) => {
                const user = await transaction.user.create({
                    data: {
                        firstName: dto.firstName.trim(),
                        lastName: dto.lastName.trim(),
                        email: dto.email.toLowerCase(),
                        phone: (0, contact_1.canonicalPhone)(dto.phone),
                        passwordHash,
                        role: client_1.UserRole.EMPLOYEE,
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
                        phone: (0, contact_1.canonicalPhone)(dto.phone),
                        specialization: dto.specialization.trim(),
                    },
                    include: { user: { select: { id: true, email: true, active: true } } },
                });
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('Cet e-mail ou ce numéro est déjà utilisé par un compte.');
            }
            throw error;
        }
    }
    async setEmployeeAccess(routeId, personnelId, actorId, active) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const person = await this.db.personnel.findFirst({
            where: { id: personnelId, stylistId: stylist.id },
        });
        if (!person) {
            throw new common_1.NotFoundException('Employé introuvable');
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
    async removeEmployee(routeId, personnelId, actorId) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const person = await this.db.personnel.findFirst({
            where: { id: personnelId, stylistId: stylist.id },
        });
        if (!person) {
            throw new common_1.NotFoundException('Employé introuvable');
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
    async createPersonnel(routeId, actorId, dto) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        return this.db.personnel.create({ data: { ...dto, stylistId: stylist.id } });
    }
    async updatePersonnel(routeId, id, actorId, dto) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const person = await this.db.personnel.findFirst({ where: { id, stylistId: stylist.id } });
        if (!person) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        const data = {
            ...dto,
            email: dto.email?.trim().toLowerCase(),
            phone: dto.phone ? (0, contact_1.canonicalPhone)(dto.phone) : undefined,
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
    async deletePersonnel(id, actorId) {
        const person = await this.db.personnel.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!person) {
            throw new common_1.NotFoundException('Employé introuvable');
        }
        if (person.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException();
        }
        return this.removeEmployee(person.stylistId, id, actorId);
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], TeamService);
//# sourceMappingURL=team.service.js.map