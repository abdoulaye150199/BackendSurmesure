import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, OrderStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAppointmentDto, CreateCatalogItemDto, CreateMeasurementDto, CreateOrderDto, CreatePersonnelDto, OrdersQueryDto, SaveClientMeasurementDto, UpdateMeasurementDto, UpdateOrderDto, UpdatePersonnelDto } from './commerce.dto';
import { OrderAggregate } from '../domain/order.aggregate';

@Injectable()
export class CommerceService {
  constructor(private readonly db: PrismaService) {}
  private async stylistProfile(routeId: string, actorId: string) {
    const profile = await this.db.stylistProfile.findFirst({ where: { OR: [{ id: routeId }, { userId: routeId }] } });
    if (!profile) throw new NotFoundException('Styliste introuvable');
    if (profile.userId !== actorId) throw new ForbiddenException('Accès interdit à cet atelier');
    return profile;
  }
  private page<T extends { id: string }>(rows: T[], limit: number) { const hasMore = rows.length > limit; if (hasMore) rows.pop(); return { data: rows, meta: { hasMore, nextCursor: hasMore ? rows.at(-1)!.id : null } }; }
  async listOrders(routeId: string, actorId: string, q: OrdersQueryDto) {
    const s = await this.stylistProfile(routeId, actorId); const rows = await this.db.order.findMany({ where: { stylistId: s.id, status: q.status }, take: q.limit + 1, ...(q.cursor && { cursor: { id: q.cursor }, skip: 1 }), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }); return this.page(rows, q.limit);
  }
  async createOrder(routeId: string, actorId: string, dto: CreateOrderDto) { const s = await this.stylistProfile(routeId, actorId); return this.db.order.create({ data: { ...dto, stylistId: s.id } }); }
  async updateOrder(id: string, actorId: string, dto: UpdateOrderDto) {
    const current = await this.assertOrder(id, actorId);
    if (dto.status) { try { new OrderAggregate(id, current.status).transitionTo(dto.status); } catch (error) { throw new BadRequestException(error instanceof Error ? error.message : 'Statut invalide'); } }
    return this.db.order.update({ where: { id }, data: { ...dto, completedAt: dto.status === OrderStatus.completed ? new Date() : undefined } });
  }
  async deleteOrder(id: string, actorId: string) { await this.assertOrder(id, actorId); await this.db.order.delete({ where: { id } }); return { success: true }; }
  async notifyOrder(id: string, actorId: string, message: string) { const order = await this.assertOrder(id, actorId); return { success: true, queued: true, recipient: order.clientPhone, message }; }
  private async assertOrder(id: string, actorId: string) { const o = await this.db.order.findUnique({ where: { id }, include: { stylist: true } }); if (!o) throw new NotFoundException('Commande introuvable'); if (o.stylist.userId !== actorId) throw new ForbiddenException(); return o; }
  async listMeasurements(routeId: string, actorId: string, limit: number, cursor?: string, query?: string) { const s = await this.stylistProfile(routeId, actorId); const rows = await this.db.measurement.findMany({ where: { stylistId: s.id, ...(query && { OR: [{ clientName: { contains: query, mode: 'insensitive' } }, { clientPhone: { contains: query } }] }) }, take: limit + 1, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }); return this.page(rows.map(({ values, ...m }) => ({ ...m, measurements: values })), limit); }
  async createMeasurement(routeId: string, actorId: string, dto: CreateMeasurementDto) { const s = await this.stylistProfile(routeId, actorId); const { measurements, ...rest } = dto; const row = await this.db.measurement.create({ data: { ...rest, values: measurements, stylistId: s.id } }); return { ...row, measurements: row.values }; }
  async updateMeasurement(id: string, actorId: string, dto: UpdateMeasurementDto) { const m = await this.db.measurement.findUnique({ where: { id }, include: { stylist: true } }); if (!m) throw new NotFoundException(); if (m.stylist.userId !== actorId) throw new ForbiddenException(); const { measurements, ...rest } = dto; return this.db.measurement.update({ where: { id }, data: { ...rest, values: measurements ?? undefined } }); }
  async deleteMeasurement(id: string, actorId: string) { await this.updateMeasurement(id, actorId, {}); await this.db.measurement.delete({ where: { id } }); return { success: true }; }
  async listPersonnel(routeId: string, actorId: string) { const s = await this.stylistProfile(routeId, actorId); return this.db.personnel.findMany({ where: { stylistId: s.id }, orderBy: { hireDate: 'desc' } }); }
  async createPersonnel(routeId: string, actorId: string, dto: CreatePersonnelDto) { const s = await this.stylistProfile(routeId, actorId); return this.db.personnel.create({ data: { ...dto, stylistId: s.id } }); }
  async updatePersonnel(routeId: string, id: string, actorId: string, dto: UpdatePersonnelDto) { const s = await this.stylistProfile(routeId, actorId); const p = await this.db.personnel.findFirst({ where: { id, stylistId: s.id } }); if (!p) throw new NotFoundException(); return this.db.personnel.update({ where: { id }, data: dto }); }
  async deletePersonnel(id: string, actorId: string) { const p = await this.db.personnel.findUnique({ where: { id }, include: { stylist: true } }); if (!p) throw new NotFoundException(); if (p.stylist.userId !== actorId) throw new ForbiddenException(); await this.db.personnel.delete({ where: { id } }); return { success: true }; }
  listCatalog(limit: number, cursor?: string) { return this.db.catalogItem.findMany({ where: { active: true }, take: limit, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }); }
  getCatalog(id: string) { return this.db.catalogItem.findUniqueOrThrow({ where: { id }, include: { stylist: { include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } } } }); }
  async createCatalog(actorId: string, dto: CreateCatalogItemDto) { const s = await this.db.stylistProfile.findUnique({ where: { userId: actorId } }); if (!s) throw new ForbiddenException(); return this.db.catalogItem.create({ data: { ...dto, stylistId: s.id } }); }
  listStylists(limit: number, cursor?: string) { return this.db.stylistProfile.findMany({ take: limit, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: [{ rating: 'desc' }, { id: 'asc' }], include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } }); }
  async createAppointment(clientId: string, dto: CreateAppointmentDto) { return this.db.appointment.create({ data: { ...dto, clientId, startsAt: new Date(dto.startsAt) } }).catch((e: unknown) => { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new ForbiddenException('Ce créneau est déjà réservé'); throw e; }); }
  async clientAppointments(clientId: string) {
    return this.db.appointment.findMany({
      where: { clientId },
      orderBy: { startsAt: 'asc' },
      include: { stylist: { select: { businessName: true, user: { select: { firstName: true, lastName: true, profileImage: true } } } } },
    });
  }
  async stylistAppointments(routeId: string, actorId: string) {
    const stylist = await this.stylistProfile(routeId, actorId);
    return this.db.appointment.findMany({
      where: { stylistId: stylist.id },
      orderBy: { startsAt: 'asc' },
      include: { client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } } },
    });
  }
  async clientOrders(clientId: string, q: OrdersQueryDto) {
    const rows = await this.db.order.findMany({
      where: { clientId, status: q.status },
      take: q.limit + 1,
      ...(q.cursor && { cursor: { id: q.cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { stylist: { select: { businessName: true } } },
    });
    return this.page(rows, q.limit);
  }
  async clientMeasurements(clientId: string) {
    const rows = await this.db.measurement.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(({ values, ...row }) => ({ ...row, measurements: values }));
  }
  async saveClientMeasurements(clientId: string, dto: SaveClientMeasurementDto) {
    const [client, stylist, current] = await Promise.all([
      this.db.user.findUnique({ where: { id: clientId } }),
      this.db.stylistProfile.findUnique({ where: { id: dto.stylistId } }),
      this.db.measurement.findFirst({ where: { clientId, stylistId: dto.stylistId }, orderBy: { createdAt: 'desc' } }),
    ]);
    if (!client) throw new NotFoundException('Client introuvable');
    if (!stylist) throw new NotFoundException('Styliste introuvable');
    const data = { values: dto.measurements, notes: dto.notes ?? '', clientName: `${client.firstName} ${client.lastName}`, clientPhone: client.phone };
    const row = current
      ? await this.db.measurement.update({ where: { id: current.id }, data })
      : await this.db.measurement.create({ data: { ...data, clientId, stylistId: dto.stylistId } });
    return { ...row, measurements: row.values };
  }

  async adminDashboard() {
    const [
      users,
      clients,
      stylists,
      orders,
      activeOrders,
      measurements,
      appointments,
      catalogItems,
      revenue,
      recentUsers,
      recentOrders,
      upcomingAppointments,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { role: UserRole.CLIENT } }),
      this.db.user.count({ where: { role: UserRole.STYLIST } }),
      this.db.order.count(),
      this.db.order.count({ where: { status: { in: [OrderStatus.pending, OrderStatus.inProgress, OrderStatus.completed] } } }),
      this.db.measurement.count(),
      this.db.appointment.count(),
      this.db.catalogItem.count(),
      this.db.order.aggregate({ where: { status: { not: OrderStatus.cancelled } }, _sum: { totalPrice: true } }),
      this.db.user.findMany({
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
        where: { startsAt: { gte: new Date() }, status: { not: AppointmentStatus.cancelled } },
        take: 12,
        orderBy: { startsAt: 'asc' },
        include: {
          stylist: { select: { businessName: true } },
          client: { select: { firstName: true, lastName: true, email: true, phone: true, profileImage: true } },
        },
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
    };
  }

  async adminSetUserStatus(actorId: string, id: string, active: boolean) {
    if (actorId === id && !active) throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte administrateur');
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.db.user.update({
      where: { id },
      data: { active, ...(!active && { refreshTokenHash: null }) },
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

  async adminUpdateOrder(id: string, dto: UpdateOrderDto) {
    const current = await this.db.order.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Commande introuvable');
    if (dto.status) {
      try {
        new OrderAggregate(id, current.status).transitionTo(dto.status);
      } catch (error) {
        throw new BadRequestException(error instanceof Error ? error.message : 'Statut invalide');
      }
    }
    return this.db.order.update({
      where: { id },
      data: { ...dto, completedAt: dto.status === OrderStatus.completed ? new Date() : undefined },
      include: {
        stylist: { select: { businessName: true } },
        client: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }
}
