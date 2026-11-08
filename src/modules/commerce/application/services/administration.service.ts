import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, OrderStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { paginate } from '../../../../shared/application/pagination';

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
      catalog,
    ] = await Promise.all([
      this.db.user.count({ where: { deletedAt: null } }),
      this.db.user.count({ where: { role: UserRole.CLIENT, deletedAt: null } }),
      this.db.user.count({ where: { role: UserRole.STYLIST, deletedAt: null } }),
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

  async adminSetUserStatus(actorId: string, id: string, active: boolean) {
    if (actorId === id && !active) {
      throw new BadRequestException(
        'Vous ne pouvez pas désactiver votre propre compte administrateur',
      );
    }
    const user = await this.db.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
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

  async adminUsers(query: PageQueryDto) {
    const rows = await this.db.user.findMany({
      where: { deletedAt: null },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
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
    return paginate(rows, query.limit);
  }

  async adminDeleteUser(actorId: string, id: string) {
    return this.db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id, deletedAt: null } });
      if (!user) {
        throw new NotFoundException('Compte introuvable ou déjà supprimé.');
      }
      if (actorId === id || user.role === UserRole.ADMIN) {
        throw new BadRequestException('La suppression des comptes administrateurs est interdite.');
      }
      const deletedAt = new Date();
      const revoke = {
        active: false,
        deletedAt,
        refreshTokenHash: null,
        sessionVersion: { increment: 1 },
      };
      if (user.role === UserRole.STYLIST) {
        const profile = await tx.stylistProfile.findUnique({ where: { userId: id } });
        if (profile) {
          const people = await tx.personnel.findMany({
            where: { stylistId: profile.id },
            select: { userId: true },
          });
          const employeeIds = people.flatMap((person) => (person.userId ? [person.userId] : []));
          await tx.user.updateMany({
            where: { id: { in: employeeIds }, role: UserRole.EMPLOYEE, deletedAt: null },
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
      } else if (user.role === UserRole.EMPLOYEE) {
        await tx.personnel.updateMany({ where: { userId: id }, data: { active: false } });
      } else if (user.role === UserRole.CLIENT) {
        await tx.appointment.updateMany({
          where: { clientId: id, status: { in: ['pending', 'confirmed'] } },
          data: { status: 'cancelled' },
        });
      }
      await tx.user.update({ where: { id }, data: revoke });
      return { success: true, id, deletion: 'logical', historyPreserved: true };
    });
  }
}
