import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppointmentStatus, OrderStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateAppointmentDto, CreateCatalogItemDto, CreateEmployeeAccountDto, CreateEmployeeMeasurementDto, CreateMeasurementDto, CreateOrderDto, CreatePersonnelDto, OrdersQueryDto, SaveClientMeasurementDto, UpdateMeasurementDto, UpdateOrderDto, UpdatePersonnelDto, UpdateStylistProfileDto, UpdateCatalogItemDto } from './commerce.dto';
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
  async createOrder(routeId: string, actorId: string, dto: CreateOrderDto) {
    const stylist = await this.stylistProfile(routeId, actorId);
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : undefined;
    if (dueAt && (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now())) {
      throw new BadRequestException('La date et l’heure de livraison doivent être dans le futur.');
    }
    if (dto.measurements && (Object.keys(dto.measurements).length > 50 || Object.entries(dto.measurements).some(([key, value]) => !key.trim() || key.length > 80 || typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 300))) {
      throw new BadRequestException('Les mesures doivent être comprises entre 0 et 300 cm (zéro exclu).');
    }
    const phone = dto.clientPhone.replace(/[\s().-]/g, '');
    const client = dto.clientId
      ? await this.db.user.findFirst({ where: { id: dto.clientId, role: UserRole.CLIENT }, select: { id: true, phone: true } })
      : (await this.db.$queryRaw<Array<{ id: string; phone: string }>>(Prisma.sql`
          SELECT "id", "phone" FROM "User"
          WHERE "role" = 'CLIENT' AND regexp_replace("phone", '[[:space:]().-]', '', 'g') = ${phone}
          ORDER BY "createdAt", "id" LIMIT 1
        `))[0];
    if (dto.clientId && (!client || client.phone.replace(/[\s().-]/g, '') !== phone)) {
      throw new BadRequestException('Le compte client ne correspond pas au téléphone indiqué.');
    }
    const data = {
      ...dto, dueAt, stylistId: stylist.id, clientId: client?.id ?? null,
      clientName: dto.clientName.trim(), clientPhone: phone, description: dto.description.trim(), notes: dto.notes?.trim(),
    };
    if (!dto.measurements || !Object.keys(dto.measurements).length) return this.db.order.create({ data });
    return this.db.$transaction(async tx => {
      const order = await tx.order.create({ data });
      await tx.measurement.create({ data: {
        stylistId: stylist.id, clientId: client?.id ?? null, clientName: data.clientName,
        clientPhone: phone, values: dto.measurements!, notes: `Commande : ${data.description}`,
      } });
      return order;
    });
  }
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
  async updateMeasurement(id: string, actorId: string, dto: UpdateMeasurementDto) { const m = await this.db.measurement.findUnique({ where: { id }, include: { stylist: true } }); if (!m) throw new NotFoundException(); if (m.stylist.userId !== actorId) throw new ForbiddenException(); const { measurements, ...rest } = dto; const updated = await this.db.measurement.update({ where: { id }, data: { ...rest, values: measurements ?? undefined } }); const { values, ...result } = updated; return { ...result, measurements: values }; }
  async deleteMeasurement(id: string, actorId: string) { await this.updateMeasurement(id, actorId, {}); await this.db.measurement.delete({ where: { id } }); return { success: true }; }
  async listPersonnel(routeId: string, actorId: string) { const s = await this.stylistProfile(routeId, actorId); return this.db.personnel.findMany({ where: { stylistId: s.id }, include: { user: { select: { id: true, email: true, active: true } } }, orderBy: { hireDate: 'desc' } }); }
  async createEmployeeAccount(routeId: string, actorId: string, dto: CreateEmployeeAccountDto) {
    const stylist = await this.stylistProfile(routeId, actorId);
    const passwordHash = await argon2.hash(dto.password);
    try {
      return await this.db.$transaction(async tx => {
        const user = await tx.user.create({ data: {
          firstName: dto.firstName.trim(), lastName: dto.lastName.trim(), email: dto.email.toLowerCase(),
          phone: dto.phone, passwordHash, role: UserRole.EMPLOYEE,
        } });
        return tx.personnel.create({
          data: { stylistId: stylist.id, userId: user.id, firstName: dto.firstName.trim(), lastName: dto.lastName.trim(), email: dto.email.toLowerCase(), phone: dto.phone, specialization: dto.specialization.trim() },
          include: { user: { select: { id: true, email: true, active: true } } },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Cet e-mail ou ce numéro est déjà utilisé par un compte.');
      }
      throw error;
    }
  }
  async setEmployeeAccess(routeId: string, personnelId: string, actorId: string, active: boolean) {
    const stylist = await this.stylistProfile(routeId, actorId);
    const person = await this.db.personnel.findFirst({ where: { id: personnelId, stylistId: stylist.id } });
    if (!person) throw new NotFoundException('Employé introuvable');
    await this.db.$transaction([
      this.db.personnel.update({ where: { id: person.id }, data: { active } }),
      ...(person.userId ? [this.db.user.update({ where: { id: person.userId }, data: { active, ...(!active && { refreshTokenHash: null }) } })] : []),
    ]);
    return { success: true, active };
  }
  async removeEmployee(routeId: string, personnelId: string, actorId: string) {
    const stylist = await this.stylistProfile(routeId, actorId);
    const person = await this.db.personnel.findFirst({ where: { id: personnelId, stylistId: stylist.id } });
    if (!person) throw new NotFoundException('Employé introuvable');
    await this.db.$transaction(async tx => {
      if (person.userId) {
        await tx.user.update({ where: { id: person.userId }, data: { active: false, refreshTokenHash: null } });
      }
      await tx.personnel.delete({ where: { id: person.id } });
    });
    return { success: true };
  }
  private async employeeProfile(actorId: string) {
    const person = await this.db.personnel.findFirst({
      where: { userId: actorId, active: true, user: { is: { active: true, role: UserRole.EMPLOYEE } } },
      include: { stylist: { select: { id: true, businessName: true } } },
    });
    if (!person) throw new ForbiddenException('Accès employé désactivé ou introuvable');
    return person;
  }
  async employeeContext(actorId: string) { return this.employeeProfile(actorId); }
  async listEmployeeMeasurements(actorId: string, limit: number, cursor?: string) {
    const employee = await this.employeeProfile(actorId);
    const rows = await this.db.measurement.findMany({ where: { stylistId: employee.stylistId }, take: limit + 1, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    return this.page(rows.map(({ values, ...measurement }) => ({ ...measurement, measurements: values })), limit);
  }
  async createEmployeeMeasurement(actorId: string, dto: CreateEmployeeMeasurementDto) {
    const employee = await this.employeeProfile(actorId);
    this.validateMeasurementValues(dto.measurements);
    const client = await this.db.user.findFirst({ where: { phone: dto.clientPhone, role: UserRole.CLIENT } });
    const row = await this.db.measurement.create({ data: {
      stylistId: employee.stylistId, clientId: client?.id ?? null, clientName: dto.clientName.trim(),
      clientPhone: dto.clientPhone, values: dto.measurements, notes: dto.notes ?? '',
    } });
    return { ...row, measurements: row.values };
  }
  async updateEmployeeMeasurement(actorId: string, id: string, dto: UpdateMeasurementDto) {
    const employee = await this.employeeProfile(actorId);
    const measurement = await this.db.measurement.findFirst({ where: { id, stylistId: employee.stylistId } });
    if (!measurement) throw new NotFoundException('Fiche de mesures introuvable');
    if (dto.measurements) this.validateMeasurementValues(dto.measurements);
    const updated = await this.db.measurement.update({ where: { id }, data: { values: dto.measurements ?? undefined, notes: dto.notes } });
    return { ...updated, measurements: updated.values };
  }
  private validateMeasurementValues(values: Record<string, number>) {
    if (!Object.keys(values).length || Object.values(values).some(value => !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 300)) {
      throw new BadRequestException('Saisissez au moins une mesure valide entre 0 et 300 cm.');
    }
  }
  async createPersonnel(routeId: string, actorId: string, dto: CreatePersonnelDto) { const s = await this.stylistProfile(routeId, actorId); return this.db.personnel.create({ data: { ...dto, stylistId: s.id } }); }
  async updatePersonnel(routeId: string, id: string, actorId: string, dto: UpdatePersonnelDto) { const s = await this.stylistProfile(routeId, actorId); const p = await this.db.personnel.findFirst({ where: { id, stylistId: s.id } }); if (!p) throw new NotFoundException(); return this.db.personnel.update({ where: { id }, data: dto }); }
  async deletePersonnel(id: string, actorId: string) { const p = await this.db.personnel.findUnique({ where: { id }, include: { stylist: true } }); if (!p) throw new NotFoundException(); if (p.stylist.userId !== actorId) throw new ForbiddenException(); await this.db.personnel.delete({ where: { id } }); return { success: true }; }
  async listCatalog(limit: number, cursor?: string) {
    const items = await this.db.catalogItem.findMany({ where: { active: true }, take: limit, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], include: { _count: { select: { likes: true } } } });
    return items.map(({ _count, ...item }) => ({ ...item, likesCount: _count.likes }));
  }
  async setCatalogLike(id: string, visitorId: string, liked: boolean) {
    const item = await this.db.catalogItem.findFirst({ where: { id, active: true }, select: { id: true } });
    if (!item) throw new NotFoundException('Création introuvable');
    return this.db.$transaction(async tx => {
      if (liked) {
        await tx.catalogLike.createMany({ data: [{ catalogItemId: id, visitorId }], skipDuplicates: true });
      } else {
        await tx.catalogLike.deleteMany({ where: { catalogItemId: id, visitorId } });
      }
      return { liked, likesCount: await tx.catalogLike.count({ where: { catalogItemId: id } }) };
    });
  }
  getCatalog(id: string) { return this.db.catalogItem.findUniqueOrThrow({ where: { id }, include: { stylist: { include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } } } }); }
  async createCatalog(actorId: string, dto: CreateCatalogItemDto) { const s = await this.db.stylistProfile.findUnique({ where: { userId: actorId } }); if (!s) throw new ForbiddenException(); return this.db.catalogItem.create({ data: { ...dto, stylistId: s.id } }); }
  async updateCatalog(id: string, actorId: string, dto: UpdateCatalogItemDto) {
    const item = await this.db.catalogItem.findUnique({ where: { id }, include: { stylist: true } });
    if (!item) throw new NotFoundException('Création introuvable');
    if (item.stylist.userId !== actorId) throw new ForbiddenException('Accès interdit à cette création');
    return this.db.catalogItem.update({ where: { id }, data: dto });
  }
  async deactivateCatalog(id: string, actorId: string) {
    const item = await this.db.catalogItem.findUnique({ where: { id }, include: { stylist: true } });
    if (!item) throw new NotFoundException('Création introuvable');
    if (item.stylist.userId !== actorId) throw new ForbiddenException('Accès interdit à cette création');
    await this.db.catalogItem.update({ where: { id }, data: { active: false } });
    return { success: true };
  }
  async updateStylistProfile(actorId: string, dto: UpdateStylistProfileDto) {
    const profile = await this.db.stylistProfile.findUnique({ where: { userId: actorId } });
    if (!profile) throw new NotFoundException('Profil styliste introuvable');
    const { profileImage, ...profileData } = dto;
    return this.db.stylistProfile.update({
      where: { id: profile.id },
      data: {
        ...profileData,
        ...(profileImage !== undefined ? { user: { update: { profileImage } } } : {}),
      },
      include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
    });
  }
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
  async updateStylistAppointmentStatus(id: string, actorId: string, status: AppointmentStatus) {
    const appointment = await this.db.appointment.findUnique({ where: { id }, include: { stylist: true } });
    if (!appointment) throw new NotFoundException('Rendez-vous introuvable');
    if (appointment.stylist.userId !== actorId) throw new ForbiddenException('Accès interdit à ce rendez-vous');
    return this.db.appointment.update({
      where: { id },
      data: { status },
      include: { client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } } },
    });
  }
  async clientOrders(clientId: string, q: OrdersQueryDto) {
    // Attach orders entered before signup using the phone on the authenticated account.
    // Never reassign an order already linked to another client.
    await this.db.$executeRaw(Prisma.sql`
      UPDATE "Order" AS orders
      SET "clientId" = client."id"
      FROM "User" AS client
      WHERE client."id" = ${clientId}::uuid
        AND client."role" = 'CLIENT' AND client."active" = true
        AND orders."clientId" IS NULL
        AND regexp_replace(orders."clientPhone", '[[:space:]().-]', '', 'g')
          = regexp_replace(client."phone", '[[:space:]().-]', '', 'g')
    `);
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
