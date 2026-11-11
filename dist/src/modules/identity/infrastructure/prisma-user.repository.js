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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/prisma/prisma.service");
const user_repository_1 = require("../domain/user.repository");
let PrismaUserRepository = class PrismaUserRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findByEmail(email) {
        return this.db.user.findUnique({
            where: { email: email.trim().toLowerCase(), deletedAt: null },
        });
    }
    findById(id) {
        return this.db.user.findUnique({ where: { id, deletedAt: null } });
    }
    findAccessById(id) {
        return this.db.user.findUnique({
            where: { id, deletedAt: null },
            select: { id: true, role: true, email: true, active: true, sessionVersion: true },
        });
    }
    async create({ businessName, ...data }) {
        try {
            return await this.db.user.create({
                data: {
                    ...data,
                    email: data.email.trim().toLowerCase(),
                    stylist: data.role === 'STYLIST'
                        ? { create: { businessName: businessName, specialties: [] } }
                        : undefined,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new user_repository_1.AccountConflictError();
            }
            throw error;
        }
    }
    async changePassword(id, expectedHash, passwordHash) {
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
    async saveRefreshToken(id, refreshTokenHash, sessionVersion, previousHash) {
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
    async revokeSessions(id) {
        await this.db.user.updateMany({
            where: { id },
            data: { refreshTokenHash: null, sessionVersion: { increment: 1 } },
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map