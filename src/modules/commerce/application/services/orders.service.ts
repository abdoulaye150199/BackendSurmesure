import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeasurementSource, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { OrderAggregate } from '../../domain/order.aggregate';
import type { CreateOrderDto, OrdersQueryDto, UpdateOrderDto } from '../commerce.dto';

import { paginate } from '../../../../shared/application/pagination';
import { validateMeasurements } from '../measurement-validation';
import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}
  async listOrders(routeId: string, actorId: string, query: OrdersQueryDto) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const rows = await this.db.order.findMany({
      where: { stylistId: stylist.id, status: query.status },
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return paginate(rows, query.limit);
  }

  async createOrder(routeId: string, actorId: string, dto: CreateOrderDto) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    return this.persistOrder(stylist.id, actorId, dto, MeasurementSource.stylist);
  }

  async createEmployeeOrder(actorId: string, dto: CreateOrderDto) {
    const employee = await this.access.employeeProfile(actorId);
    return this.persistOrder(employee.stylistId, actorId, dto, MeasurementSource.employee);
  }

  async listEmployeeOrders(actorId: string, query: OrdersQueryDto) {
    const employee = await this.access.employeeProfile(actorId);
    const rows = await this.db.order.findMany({
      where: { stylistId: employee.stylistId, status: query.status },
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return paginate(rows, query.limit);
  }

  private async persistOrder(
    stylistId: string,
    actorId: string,
    dto: CreateOrderDto,
    source: MeasurementSource,
  ) {
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : undefined;
    if (dueAt && (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now())) {
      throw new BadRequestException('La date et l’heure de livraison doivent être dans le futur.');
    }
    if (dto.measurements !== undefined) {
      validateMeasurements(dto.measurements);
    }
    if (source === MeasurementSource.employee && dto.clientId) {
      throw new BadRequestException('Le rattachement au compte doit être validé par le styliste.');
    }
    const phone = dto.clientPhone.replace(/[\s().-]/g, '');
    const client = dto.clientId
      ? await this.db.user.findFirst({
          where: { id: dto.clientId, role: UserRole.CLIENT, active: true },
          select: { id: true, phone: true },
        })
      : null;
    if (dto.clientId && (!client || client.phone.replace(/[\s().-]/g, '') !== phone)) {
      throw new BadRequestException('Le compte client ne correspond pas au téléphone indiqué.');
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
          validatedAt: source === MeasurementSource.stylist ? new Date() : null,
          validatedById: source === MeasurementSource.stylist ? actorId : null,
          modelName: data.description,
          values: dto.measurements!,
          notes: `Commande : ${data.description}`,
        },
      });
      return order;
    });
  }

  async updateOrder(id: string, actorId: string, dto: UpdateOrderDto) {
    const current = await this.assertOrder(id, actorId);
    return this.persistUpdate(current, dto);
  }
  private async persistUpdate(
    current: { id: string; status: OrderStatus; updatedAt: Date },
    dto: UpdateOrderDto,
  ) {
    if (dto.status) {
      try {
        new OrderAggregate(current.id, current.status).transitionTo(dto.status);
      } catch (error) {
        throw new BadRequestException(error instanceof Error ? error.message : 'Statut invalide');
      }
    }
    const result = await this.db.order.updateMany({
      where: { id: current.id, updatedAt: current.updatedAt },
      data: {
        ...dto,
        completedAt:
          dto.status === OrderStatus.completed && current.status !== OrderStatus.completed
            ? new Date()
            : undefined,
      },
    });
    if (!result.count) {
      throw new ConflictException(
        'Cette commande a été modifiée. Actualisez-la avant de réessayer.',
      );
    }
    return this.db.order.findUniqueOrThrow({
      where: { id: current.id },
      include: {
        stylist: { select: { businessName: true } },
        client: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
  async deleteOrder(id: string, actorId: string) {
    await this.assertOrder(id, actorId);
    await this.db.order.delete({ where: { id } });
    return { success: true };
  }

  async notifyOrder(id: string, actorId: string, message: string) {
    const order = await this.assertOrder(id, actorId);
    if (!order.clientId || !order.clientConfirmedAt) {
      throw new ConflictException('Rattachez d’abord cette commande au compte client.');
    }
    const notification = await this.db.clientNotification.create({
      data: { clientId: order.clientId, orderId: id, message: message.trim() },
    });
    return { success: true, queued: false, channel: 'inApp', notificationId: notification.id };
  }
  private async assertOrder(id: string, actorId: string) {
    const order = await this.db.order.findUnique({ where: { id }, include: { stylist: true } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    if (order.stylist.userId !== actorId) {
      throw new ForbiddenException();
    }
    return order;
  }

  async clientOrders(clientId: string, query: OrdersQueryDto) {
    const rows = await this.db.order.findMany({
      where: { clientId, clientConfirmedAt: { not: null }, status: query.status },
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { stylist: { select: { businessName: true } } },
    });
    return paginate(rows, query.limit);
  }

  async adminUpdateOrder(id: string, dto: UpdateOrderDto) {
    const current = await this.db.order.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Commande introuvable');
    }
    return this.persistUpdate(current, dto);
  }
}
