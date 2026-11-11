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
exports.MeasurementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const contact_1 = require("../../../../shared/domain/contact");
const pagination_1 = require("../../../../shared/application/pagination");
const measurement_validation_1 = require("../measurement-validation");
const commerce_access_service_1 = require("./commerce-access.service");
let MeasurementsService = class MeasurementsService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async listMeasurements(routeId, actorId, limit, cursor, query) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const rows = await this.db.measurement.findMany({
            where: {
                stylistId: stylist.id,
                ...(query && {
                    OR: [
                        { clientName: { contains: query, mode: 'insensitive' } },
                        { clientPhone: { contains: query } },
                    ],
                }),
            },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        return (0, pagination_1.paginate)(rows.map(({ values, ...m }) => ({ ...m, measurements: values })), limit);
    }
    async createMeasurement(routeId, actorId, dto) {
        (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const { measurements, ...rest } = dto;
        if (rest.clientId) {
            await this.access.assertClientPhone(rest.clientId, rest.clientPhone);
        }
        rest.clientPhone = (0, contact_1.canonicalPhone)(rest.clientPhone);
        const row = await this.db.measurement.create({
            data: {
                ...rest,
                clientConfirmedAt: rest.clientId ? new Date() : null,
                values: measurements,
                stylistId: stylist.id,
                source: client_1.MeasurementSource.stylist,
                validatedAt: new Date(),
                validatedById: actorId,
            },
        });
        return { ...row, measurements: row.values };
    }
    async updateMeasurement(id, actorId, dto) {
        const measurement = await this.db.measurement.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!measurement) {
            throw new common_1.NotFoundException();
        }
        if (measurement.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException();
        }
        if (dto.measurements) {
            (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        }
        const { measurements, ...rest } = dto;
        const updated = await this.db.measurement.update({
            where: { id },
            data: {
                ...rest,
                values: measurements ?? undefined,
                ...(measurements &&
                    (measurement.source === client_1.MeasurementSource.client
                        ? { validatedAt: null, validatedById: null }
                        : {
                            source: client_1.MeasurementSource.stylist,
                            validatedAt: new Date(),
                            validatedById: actorId,
                        })),
            },
        });
        const { values, ...result } = updated;
        return { ...result, measurements: values };
    }
    async validateMeasurement(id, actorId, dto) {
        const record = await this.db.measurement.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!record) {
            throw new common_1.NotFoundException('Fiche de mesures introuvable');
        }
        if (record.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException('Accès interdit à cette fiche');
        }
        const modelName = dto.modelName.trim();
        if (modelName.length < 2) {
            throw new common_1.BadRequestException('Précisez le modèle concerné par la validation.');
        }
        (0, measurement_validation_1.validateMeasurements)(record.values);
        const result = await this.db.measurement.updateMany({
            where: { id, stylistId: record.stylistId, updatedAt: new Date(dto.expectedUpdatedAt) },
            data: { modelName, validatedAt: new Date(), validatedById: actorId },
        });
        if (!result.count) {
            throw new common_1.ConflictException('Ces mesures ont été modifiées. Actualisez la fiche avant de la valider.');
        }
        const { values, ...updated } = await this.db.measurement.findUniqueOrThrow({ where: { id } });
        return { ...updated, measurements: values };
    }
    async deleteMeasurement(id, actorId) {
        const record = await this.db.measurement.findUnique({
            where: { id },
            include: { stylist: true },
        });
        if (!record) {
            throw new common_1.NotFoundException('Fiche introuvable');
        }
        if (record.stylist.userId !== actorId) {
            throw new common_1.ForbiddenException();
        }
        await this.db.measurement.delete({ where: { id } });
        return { success: true };
    }
    async listEmployeeMeasurements(actorId, limit, cursor) {
        const employee = await this.access.employeeProfile(actorId);
        const rows = await this.db.measurement.findMany({
            where: { stylistId: employee.stylistId },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        return (0, pagination_1.paginate)(rows.map(({ values, ...measurement }) => ({ ...measurement, measurements: values })), limit);
    }
    async createEmployeeMeasurement(actorId, dto) {
        const employee = await this.access.employeeProfile(actorId);
        (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        const row = await this.db.measurement.create({
            data: {
                stylistId: employee.stylistId,
                clientId: null,
                clientName: dto.clientName.trim(),
                clientPhone: (0, contact_1.canonicalPhone)(dto.clientPhone),
                source: client_1.MeasurementSource.employee,
                values: dto.measurements,
                notes: dto.notes ?? '',
            },
        });
        return { ...row, measurements: row.values };
    }
    async updateEmployeeMeasurement(actorId, id, dto) {
        const employee = await this.access.employeeProfile(actorId);
        const measurement = await this.db.measurement.findFirst({
            where: { id, stylistId: employee.stylistId },
        });
        if (!measurement) {
            throw new common_1.NotFoundException('Fiche de mesures introuvable');
        }
        if (dto.measurements) {
            (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        }
        const updated = await this.db.measurement.update({
            where: { id },
            data: {
                values: dto.measurements ?? undefined,
                notes: dto.notes,
                ...(dto.measurements && {
                    source: client_1.MeasurementSource.employee,
                    validatedAt: null,
                    validatedById: null,
                }),
            },
        });
        return { ...updated, measurements: updated.values };
    }
    async clientMeasurements(clientId) {
        const rows = await this.db.measurement.findMany({
            where: { clientId, clientConfirmedAt: { not: null } },
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        });
        return rows.map(({ values, ...row }) => ({ ...row, measurements: values }));
    }
    async saveClientMeasurements(clientId, dto) {
        (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        const [client, stylist, current] = await Promise.all([
            this.db.user.findUnique({ where: { id: clientId } }),
            this.db.stylistProfile.findUnique({ where: { id: dto.stylistId } }),
            this.db.measurement.findFirst({
                where: {
                    clientId,
                    clientConfirmedAt: { not: null },
                    stylistId: dto.stylistId,
                    ...(dto.measurementId ? { id: dto.measurementId } : { modelName: null }),
                },
                orderBy: { updatedAt: 'desc' },
            }),
        ]);
        if (!client) {
            throw new common_1.NotFoundException('Client introuvable');
        }
        if (!stylist) {
            throw new common_1.NotFoundException('Styliste introuvable');
        }
        if (dto.measurementId && !current) {
            throw new common_1.NotFoundException('Fiche de mesures introuvable');
        }
        const data = {
            source: client_1.MeasurementSource.client,
            clientConfirmedAt: new Date(),
            validatedAt: null,
            validatedById: null,
            values: dto.measurements,
            notes: dto.notes ?? current?.notes ?? '',
            clientName: `${client.firstName} ${client.lastName}`,
            clientPhone: client.phone,
        };
        const row = current
            ? await this.db.measurement.update({ where: { id: current.id }, data })
            : await this.db.measurement.create({ data: { ...data, clientId, stylistId: dto.stylistId } });
        return { ...row, measurements: row.values };
    }
    async createClientModelMeasurements(clientId, dto) {
        (0, measurement_validation_1.validateMeasurements)(dto.measurements);
        const modelName = dto.modelName.trim();
        if (modelName.length < 2) {
            throw new common_1.BadRequestException('Précisez le nom du modèle.');
        }
        const [client, stylist] = await Promise.all([
            this.db.user.findFirst({ where: { id: clientId, role: client_1.UserRole.CLIENT, active: true } }),
            this.db.stylistProfile.findUnique({ where: { id: dto.stylistId } }),
        ]);
        if (!client) {
            throw new common_1.NotFoundException('Client introuvable');
        }
        if (!stylist) {
            throw new common_1.NotFoundException('Styliste introuvable');
        }
        const { values, ...row } = await this.db.measurement.create({
            data: {
                stylistId: stylist.id,
                clientId: client.id,
                clientName: `${client.firstName} ${client.lastName}`,
                source: client_1.MeasurementSource.client,
                clientConfirmedAt: new Date(),
                clientPhone: client.phone,
                modelName,
                modelType: dto.modelType?.trim(),
                values: dto.measurements,
                notes: dto.notes?.trim() ?? '',
            },
        });
        return { ...row, measurements: values };
    }
};
exports.MeasurementsService = MeasurementsService;
exports.MeasurementsService = MeasurementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], MeasurementsService);
//# sourceMappingURL=measurements.service.js.map