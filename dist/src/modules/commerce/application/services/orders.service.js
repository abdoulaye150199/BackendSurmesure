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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const order_aggregate_1 = require("../../domain/order.aggregate");
const pagination_1 = require("../../../../shared/application/pagination");
const measurement_validation_1 = require("../measurement-validation");
const commerce_access_service_1 = require("./commerce-access.service");
let OrdersService = class OrdersService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async listOrders(routeId, actorId, query) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const rows = await this.db.order.findMany({
            where: { stylistId: stylist.id, status: query.status },
            take: query.limit + 1,
            ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        return (0, pagination_1.paginate)(rows, query.limit);
    }
    async createOrder(routeId, actorId, dto) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        return this.persistOrder(stylist.id, actorId, dto, client_1.MeasurementSource.stylist);
    }
    async createEmployeeOrder(actorId, dto) {
        const employee = await this.access.employeeProfile(actorId);
        return this.persistOrder(employee.stylistId, actorId, dto, client_1.MeasurementSource.employee);
    }
    async listEmployeeOrders(actorId, query) {
        const employee = await this.access.employeeProfile(actorId);
        const rows = await this.db.order.findMany({
            where: { stylistId: employee.stylistId, status: query.status },
            take: query.limit + 1,
            ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        return (0, pagination_1.paginate)(rows, query.limit);
    }
    async persistOrder(stylistId, actorId, dto, source) {
        const dueAt = dto.dueAt ? new Date(dto.dueAt) : undefined;
        if (dueAt && (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now())) {
            throw new common_1.BadRequestException('La date et l’heure de livraison doivent être dans le futur.');
        }
        if (dto.measurements !== undefined) {
            (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        }
        if (source === client_1.MeasurementSource.employee && dto.clientId) {
            throw new common_1.BadRequestException('Le rattachement au compte doit être validé par le styliste.');
        }
        const phone = dto.clientPhone.replace(/[\s().-]/g, '');
        const client = dto.clientId
            ? await this.db.user.findFirst({
                where: { id: dto.clientId, role: client_1.UserRole.CLIENT, active: true },
                select: { id: true, phone: true },
            })
            : null;
        if (dto.clientId && (!client || client.phone.replace(/[\s().-]/g, '') !== phone)) {
            throw new common_1.BadRequestException('Le compte client ne correspond pas au téléphone indiqué.');
        }
        const data = {
            ...dto,
            dueAt,
            stylistId,
            clientId: client?.id ?? null,
            clientConfirmedAt: client ? new Date() : null,
            clientName: dto.clientName.trim(),
            clientPhone: phone,
            description: dto.description.trim(),
            notes: dto.notes?.trim(),
        };
        if (!dto.measurements || !Object.keys(dto.measurements).length) {
            return this.db.order.create({ data });
        }
        return this.db.$transaction(async (transaction) => {
            const order = await transaction.order.create({ data });
            await transaction.measurement.create({
                data: {
                    stylistId,
                    clientId: client?.id ?? null,
                    clientConfirmedAt: client ? new Date() : null,
                    clientName: data.clientName,
                    clientPhone: phone,
                    source,
                    validatedAt: source === client_1.MeasurementSource.stylist ? new Date() : null,
                    validatedById: source === client_1.MeasurementSource.stylist ? actorId : null,
                    modelName: data.description,
                    values: dto.measurements,
                    notes: `Commande : ${data.description}`,
                },
            });
            return order;
        });
    }
    async updateOrder(id, actorId, dto) {
        const current = await this.assertOrder(id, actorId);
        return this.persistUpdate(current, dto);
    }
    async persistUpdate(current, dto) {
        if (dto.status) {
            try {
                new order_aggregate_1.OrderAggregate(current.id, current.status).transitionTo(dto.status);
            }
            catch (error) {
                throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Statut invalide');
            }
        }
        const result = await this.db.order.updateMany({
            where: { id: current.id, updatedAt: current.updatedAt },
            data: {
                ...dto,
                completedAt: dto.status === client_1.OrderStatus.completed && current.status !== client_1.OrderStatus.completed
                    ? new Date()
                    : undefined,
            },
        });
        if (!result.count) {
            throw new common_1.ConflictException('Cette commande a été modifiée. Actualisez-la avant de réessayer.');
        }
        return this.db.order.findUniqueOrThrow({
            where: { id: current.id },
            include: {
                stylist: { select: { businessName: true } },
                client: { select: { firstName: true, lastName: true, email: true } },
            },
        });
    }
    async deleteOrder(id, actorId) {
        await this.assertOrder(id, actorId);
        await this.db.order.delete({ where: { id } });
        return { success: true };
    }
    async notifyOrder(id, actorId, message) {
        const order = await this.assertOrder(id, actorId);
        if (!order.clientId || !order.clientConfirmedAt) {
            throw new common_1.ConflictException('Rattachez d’abord cette commande au compte client.');
        }
        const notification = await this.db.clientNotification.create({
            data: { clientId: order.clientId, orderId: id, message: message.trim() },
        });
        return { success: true, queued: false, channel: 'inApp', notificationId: notification.id };
    }
    async assertOrder(id, actorId) {
        const order = await this.db.order.findUnique({ where: { id }, include: { stylist: true } });
        if (!order) {
            throw new common_1.NotFoundException('Commande introuvable');
        }
        if (order.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException();
        }
        return order;
    }
    async clientOrders(clientId, query) {
        const rows = await this.db.order.findMany({
            where: { clientId, clientConfirmedAt: { not: null }, status: query.status },
            take: query.limit + 1,
            ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: { stylist: { select: { businessName: true } } },
        });
        return (0, pagination_1.paginate)(rows, query.limit);
    }
    async adminUpdateOrder(id, dto) {
        const current = await this.db.order.findUnique({ where: { id } });
        if (!current) {
            throw new common_1.NotFoundException('Commande introuvable');
        }
        return this.persistUpdate(current, dto);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map