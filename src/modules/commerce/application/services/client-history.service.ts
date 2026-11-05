import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { canonicalPhone } from '../../../../shared/domain/contact';
import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class ClientHistoryService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}

  async candidates(routeId: string, actorId: string, phoneInput: string) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const phone = canonicalPhone(phoneInput);
    // Matching names are disclosed only for a phone already present in this atelier's history.
    if (process.env.DATABASE_PROVIDER === 'mysql') {
      return this.db.$queryRaw<
        Array<{ id: string; firstName: string; lastName: string; phone: string }>
      >(Prisma.sql`
        SELECT client.id, client.firstName, client.lastName, client.phone
        FROM \`User\` client
        WHERE client.role = 'CLIENT' AND client.active = true
          AND REGEXP_REPLACE(client.phone, '[[:space:]().-]', '') = ${phone}
          AND (EXISTS (
            SELECT 1 FROM \`Order\` orders WHERE orders.stylistId = ${stylist.id} AND orders.clientConfirmedAt IS NULL
            AND REGEXP_REPLACE(orders.clientPhone, '[[:space:]().-]', '') = ${phone}
          ) OR EXISTS (
            SELECT 1 FROM Measurement measures WHERE measures.stylistId = ${stylist.id} AND measures.clientConfirmedAt IS NULL
            AND REGEXP_REPLACE(measures.clientPhone, '[[:space:]().-]', '') = ${phone}
          ))
        ORDER BY client.createdAt, client.id LIMIT 5
      `);
    }
    return this.db.$queryRaw<
      Array<{ id: string; firstName: string; lastName: string; phone: string }>
    >(Prisma.sql`
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

  async link(routeId: string, actorId: string, clientId: string, phoneInput: string) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const phone = canonicalPhone(phoneInput);
    return this.db.$transaction(
      async (transaction) => {
        const client = await transaction.user.findFirst({
          where: { id: clientId, role: UserRole.CLIENT, active: true },
          select: { phone: true },
        });
        if (!client) {
          throw new NotFoundException('Compte client introuvable');
        }
        if (canonicalPhone(client.phone) !== phone) {
          throw new BadRequestException(
            'Le téléphone ne correspond pas au compte client confirmé.',
          );
        }
        const orders = process.env.DATABASE_PROVIDER === 'mysql'
          ? await transaction.$executeRaw(Prisma.sql`
        UPDATE \`Order\` SET clientId = ${clientId}, clientConfirmedAt = CURRENT_TIMESTAMP(3)
        WHERE stylistId = ${stylist.id} AND clientConfirmedAt IS NULL AND (clientId IS NULL OR clientId = ${clientId})
          AND REGEXP_REPLACE(clientPhone, '[[:space:]().-]', '') = ${phone}
      `)
          : await transaction.$executeRaw(Prisma.sql`
        UPDATE "Order" SET "clientId" = ${clientId}::uuid, "clientConfirmedAt" = CURRENT_TIMESTAMP
        WHERE "stylistId" = ${stylist.id}::uuid AND "clientConfirmedAt" IS NULL AND ("clientId" IS NULL OR "clientId" = ${clientId}::uuid)
          AND regexp_replace("clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
      `);
        const measurements = process.env.DATABASE_PROVIDER === 'mysql'
          ? await transaction.$executeRaw(Prisma.sql`
        UPDATE Measurement SET clientId = ${clientId}, clientConfirmedAt = CURRENT_TIMESTAMP(3)
        WHERE stylistId = ${stylist.id} AND clientConfirmedAt IS NULL AND (clientId IS NULL OR clientId = ${clientId})
          AND REGEXP_REPLACE(clientPhone, '[[:space:]().-]', '') = ${phone}
      `)
          : await transaction.$executeRaw(Prisma.sql`
        UPDATE "Measurement" SET "clientId" = ${clientId}::uuid, "clientConfirmedAt" = CURRENT_TIMESTAMP
        WHERE "stylistId" = ${stylist.id}::uuid AND "clientConfirmedAt" IS NULL AND ("clientId" IS NULL OR "clientId" = ${clientId}::uuid)
          AND regexp_replace("clientPhone", '[[:space:]().-]', '', 'g') = ${phone}
      `);
        return { clientId, orders, measurements };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
