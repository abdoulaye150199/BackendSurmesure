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
exports.ClientHistoryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../../infrastructure/prisma/prisma.service");
const contact_1 = require("../../../../shared/domain/contact");
const commerce_access_service_1 = require("./commerce-access.service");
let ClientHistoryService = class ClientHistoryService {
    db;
    access;
    constructor(db, access) {
        this.db = db;
        this.access = access;
    }
    async candidates(routeId, actorId, phoneInput) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const phone = (0, contact_1.canonicalPhone)(phoneInput);
        return this.db.$queryRaw(client_1.Prisma.sql `
        SELECT client."id", client."firstName", client."lastName", client."phone"
      FROM "User" client
      WHERE client."role" = 'CLIENT' AND client."active" = true
        AND regexp_replace(client."phone", '[[:space:]().-]', '', 'g') = ${phone}
        AND (EXISTS (
          SELECT 1 FROM "Order" orders WHERE orders."stylistId" = ${stylist.id}::uuid AND orders."clientConfirmedAt" IS NULL
          AND regexp_replace(orders."clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
        ) OR EXISTS (
          SELECT 1 FROM "Measurement" measures WHERE measures."stylistId" = ${stylist.id}::uuid AND measures."clientConfirmedAt" IS NULL
          AND regexp_replace(measures."clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
        ))
      ORDER BY client."createdAt", client."id" LIMIT 5
    `);
    }
    async link(routeId, actorId, clientId, phoneInput) {
        const stylist = await this.access.stylistProfile(routeId, actorId);
        const phone = (0, contact_1.canonicalPhone)(phoneInput);
        return this.db.$transaction(async (transaction) => {
            const client = await transaction.user.findFirst({
                where: { id: clientId, role: client_1.UserRole.CLIENT, active: true },
                select: { phone: true },
            });
            if (!client) {
                throw new common_1.NotFoundException('Compte client introuvable');
            }
            if ((0, contact_1.canonicalPhone)(client.phone) !== phone) {
                throw new common_1.BadRequestException('Le téléphone ne correspond pas au compte client confirmé.');
            }
            const orders = await transaction.$executeRaw(client_1.Prisma.sql `
        UPDATE "Order" SET "clientId" = ${clientId}::uuid, "clientConfirmedAt" = CURRENT_TIMESTAMP
        WHERE "stylistId" = ${stylist.id}::uuid AND "clientConfirmedAt" IS NULL AND ("clientId" IS NULL OR "clientId" = ${clientId}::uuid)
          AND regexp_replace("clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
      `);
            const measurements = await transaction.$executeRaw(client_1.Prisma.sql `
        UPDATE "Measurement" SET "clientId" = ${clientId}::uuid, "clientConfirmedAt" = CURRENT_TIMESTAMP
        WHERE "stylistId" = ${stylist.id}::uuid AND "clientConfirmedAt" IS NULL AND ("clientId" IS NULL OR "clientId" = ${clientId}::uuid)
          AND regexp_replace("clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
      `);
            return { clientId, orders, measurements };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
    }
};
exports.ClientHistoryService = ClientHistoryService;
exports.ClientHistoryService = ClientHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commerce_access_service_1.CommerceAccessService])
], ClientHistoryService);
//# sourceMappingURL=client-history.service.js.map