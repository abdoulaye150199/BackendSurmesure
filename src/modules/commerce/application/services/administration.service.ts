import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class AdministrationService {
  constructor(private readonly db: PrismaService) {}
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
      this.db.order.count({
        where: {
          status: { in: [OrderStatus.pending, OrderStatus.inProgress, OrderStatus.completed] },
        },
      }),
      this.db.measurement.count(),
      this.db.appointment.count(),
      this.db.catalogItem.count(),
      this.db.order.aggregate({
        where: { status: { not: OrderStatus.cancelled } },
        _sum: { totalPrice: true },
      }),
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
    if (actorId === id && !active) {
      throw new BadRequestException(
        'Vous ne pouvez pas désactiver votre propre compte administrateur',
      );
    }
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return this.db.user.update({
      where: { id },
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
}
