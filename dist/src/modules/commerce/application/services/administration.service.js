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
exports.AdministrationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const pagination_1 = require("../../../../shared/application/pagination");
let AdministrationService = class AdministrationService {
    db;
    constructor(db) {
        this.db = db;
    }
    async adminDashboard() {
        const [users, clients, stylists, orders, activeOrders, measurements, appointments, catalogItems, revenue, recentUsers, recentOrders, upcomingAppointments, catalog,] = await Promise.all([
            this.db.user.count({ where: { deletedAt: null } }),
            this.db.user.count({ where: { role: client_1.UserRole.CLIENT, deletedAt: null } }),
            this.db.user.count({ where: { role: client_1.UserRole.STYLIST, deletedAt: null } }),
            this.db.order.count(),
            this.db.order.count({
                where: {
                    status: { in: [client_1.OrderStatus.pending, client_1.OrderStatus.inProgress, client_1.OrderStatus.completed] },
                },
            }),
            this.db.measurement.count(),
            this.db.appointment.count(),
            this.db.catalogItem.count(),
            this.db.order.aggregate({
                where: { status: { not: client_1.OrderStatus.cancelled } },
                _sum: { totalPrice: true },
            }),
            this.db.user.findMany({
                where: { deletedAt: null },
                take: 24,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    role: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    profileImage: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
                    stylist: { select: { id: true, businessName: true, specialties: true, rating: true } },
                },
            }),
            this.db.order.findMany({
                take: 20,
                orderBy: { updatedAt: 'desc' },
                include: {
                    stylist: { select: { businessName: true } },
                    client: { select: { firstName: true, lastName: true, email: true } },
                },
            }),
            this.db.appointment.findMany({
                where: { startsAt: { gte: new Date() }, status: { not: client_1.AppointmentStatus.cancelled } },
                take: 12,
                orderBy: { startsAt: 'asc' },
                include: {
                    stylist: { select: { businessName: true } },
                    client: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            profileImage: true,
                        },
                    },
                },
            }),
            this.db.catalogItem.findMany({
                take: 30,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                include: { stylist: { select: { businessName: true } } },
            }),
        ]);
        return {
            summary: {
                users,
                clients,
                stylists,
                orders,
                activeOrders,
                measurements,
                appointments,
                catalogItems,
                revenue: revenue._sum.totalPrice ?? 0,
            },
            users: recentUsers,
            orders: recentOrders,
            appointments: upcomingAppointments,
            catalog,
        };
    }
    async adminSetUserStatus(actorId, id, active) {
        if (actorId === id && !active) {
            throw new common_1.BadRequestException('Vous ne pouvez pas désactiver votre propre compte administrateur');
        }
        const user = await this.db.user.findUnique({ where: { id, deletedAt: null } });
        if (!user) {
            throw new common_1.NotFoundException('Utilisateur introuvable');
        }
        return this.db.user.update({
            where: { id, deletedAt: null },
            data: {
                active,
                ...(!active && { refreshTokenHash: null, sessionVersion: { increment: 1 } }),
            },
            select: {
                id: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                stylist: { select: { id: true, businessName: true, specialties: true, rating: true } },
            },
        });
    }
    async adminUsers(query) {
        const search = query.search?.trim();
        const where = {
            deletedAt: null,
            ...(query.role ? { role: query.role } : {}),
            ...(search
                ? {
                    OR: [
                        ...['firstName', 'lastName', 'email', 'phone'].map((field) => ({
                            [field]: { contains: search, mode: 'insensitive' },
                        })),
                        { stylist: { businessName: { contains: search, mode: 'insensitive' } } },
                    ],
                }
                : {}),
        };
        const total = await this.db.user.count({ where });
        const totalPages = Math.max(1, Math.ceil(total / query.limit));
        const page = Math.min(query.page ?? 1, totalPages);
        const rows = await this.db.user.findMany({
            where,
            take: query.limit + 1,
            ...(query.page !== undefined
                ? { skip: (page - 1) * query.limit }
                : query.cursor
                    ? { cursor: { id: query.cursor }, skip: 1 }
                    : {}),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: {
                id: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                stylist: { select: { id: true, businessName: true, specialties: true, rating: true } },
            },
        });
        const result = (0, pagination_1.paginate)(rows, query.limit);
        return { ...result, meta: { ...result.meta, total, page, totalPages } };
    }
    async adminDeleteUser(actorId, id) {
        return this.db.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id, deletedAt: null } });
            if (!user) {
                throw new common_1.NotFoundException('Compte introuvable ou déjà supprimé.');
            }
            if (actorId === id || user.role === client_1.UserRole.ADMIN) {
                throw new common_1.BadRequestException('La suppression des comptes administrateurs est interdite.');
            }
            const deletedAt = new Date();
            const revoke = {
                active: false,
                deletedAt,
                refreshTokenHash: null,
                sessionVersion: { increment: 1 },
            };
            if (user.role === client_1.UserRole.STYLIST) {
                const profile = await tx.stylistProfile.findUnique({ where: { userId: id } });
                if (profile) {
                    const people = await tx.personnel.findMany({
                        where: { stylistId: profile.id },
                        select: { userId: true },
                    });
                    const employeeIds = people.flatMap((person) => (person.userId ? [person.userId] : []));
                    await tx.user.updateMany({
                        where: { id: { in: employeeIds }, role: client_1.UserRole.EMPLOYEE, deletedAt: null },
                        data: revoke,
                    });
                    await tx.personnel.updateMany({
                        where: { stylistId: profile.id },
                        data: { active: false },
                    });
                    await tx.catalogItem.updateMany({
                        where: { stylistId: profile.id },
                        data: { active: false },
                    });
                    await tx.appointment.updateMany({
                        where: { stylistId: profile.id, status: { in: ['pending', 'confirmed'] } },
                        data: { status: 'cancelled' },
                    });
                }
            }
            else if (user.role === client_1.UserRole.EMPLOYEE) {
                await tx.personnel.updateMany({ where: { userId: id }, data: { active: false } });
            }
            else if (user.role === client_1.UserRole.CLIENT) {
                await tx.appointment.updateMany({
                    where: { clientId: id, status: { in: ['pending', 'confirmed'] } },
                    data: { status: 'cancelled' },
                });
            }
            await tx.user.update({ where: { id }, data: revoke });
            return { success: true, id, deletion: 'logical', historyPreserved: true };
        });
    }
};
exports.AdministrationService = AdministrationService;
exports.AdministrationService = AdministrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdministrationService);
//# sourceMappingURL=administration.service.js.map