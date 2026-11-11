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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const appointment_1 = require("../../domain/appointment");
const commerce_access_service_1 = require("./commerce-access.service");
let AppointmentsService = class AppointmentsService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async createAppointment(clientId, dto) {
        const startsAt = new Date(dto.startsAt);
        if (!Number.isFinite(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Choisissez une date et une heure dans le futur.');
        }
        if (dto.service.trim().length < 2) {
            throw new common_1.BadRequestException('Précisez le motif du rendez-vous.');
        }
        const [client, stylist] = await Promise.all([
            this.db.user.findFirst({
                where: { id: clientId, role: client_1.UserRole.CLIENT, active: true },
                select: { id: true },
            }),
            this.db.stylistProfile.findFirst({
                where: { id: dto.stylistId, user: { is: { active: true } } },
                select: { id: true },
            }),
        ]);
        if (!client) {
            throw new common_1.ForbiddenException('Un compte client actif est nécessaire.');
        }
        if (!stylist) {
            throw new common_1.NotFoundException('Cet atelier n’est pas disponible.');
        }
        try {
            return await this.db.appointment.create({
                data: {
                    stylistId: stylist.id,
                    clientId,
                    service: dto.service.trim(),
                    notes: dto.notes?.trim(),
                    startsAt,
                    status: client_1.AppointmentStatus.pending,
                },
                include: {
                    stylist: {
                        select: {
                            businessName: true,
                            user: { select: { firstName: true, lastName: true, profileImage: true } },
                        },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('Ce créneau est déjà réservé. Choisissez un autre horaire.');
            }
            throw error;
        }
    }
    async clientAppointments(clientId) {
        return this.db.appointment.findMany({
            where: { clientId },
            orderBy: { startsAt: 'asc' },
            include: {
                stylist: {
                    select: {
                        businessName: true,
                        user: { select: { firstName: true, lastName: true, profileImage: true } },
                    },
                },
            },
        });
    }
    async stylistAppointments(routeId, actorId) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        return this.db.appointment.findMany({
            where: { stylistId: stylist.id },
            orderBy: { startsAt: 'asc' },
            include: {
                client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } },
            },
        });
    }
    async updateStylistAppointmentStatus(id, actorId, status) {
        const appointment = await this.db.appointment.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Rendez-vous introuvable');
        }
        if (appointment.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException('Accès interdit à ce rendez-vous');
        }
        try {
            (0, appointment_1.assertAppointmentTransition)(appointment.status, status);
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Statut invalide');
        }
        if (appointment.status !== status) {
            const result = await this.db.appointment.updateMany({
                where: { id, status: appointment.status },
                data: { status },
            });
            if (!result.count) {
                throw new common_1.ConflictException('Ce rendez-vous a été modifié. Actualisez-le.');
            }
        }
        return this.db.appointment.findUniqueOrThrow({
            where: { id },
            include: {
                client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } },
            },
        });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map