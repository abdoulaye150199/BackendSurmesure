import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { assertAppointmentTransition } from '../../domain/appointment';
import type { CreateAppointmentDto } from '../commerce.dto';

import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}
  async createAppointment(clientId: string, dto: CreateAppointmentDto) {
    const startsAt = new Date(dto.startsAt);
    if (!Number.isFinite(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Choisissez une date et une heure dans le futur.');
    }
    if (dto.service.trim().length < 2) {
      throw new BadRequestException('Précisez le motif du rendez-vous.');
    }
    const [client, stylist] = await Promise.all([
      this.db.user.findFirst({
        where: { id: clientId, role: UserRole.CLIENT, active: true },
        select: { id: true },
      }),
      this.db.stylistProfile.findFirst({
        where: { id: dto.stylistId, user: { is: { active: true } } },
        select: { id: true },
      }),
    ]);
    if (!client) {
      throw new ForbiddenException('Un compte client actif est nécessaire.');
    }
    if (!stylist) {
      throw new NotFoundException('Cet atelier n’est pas disponible.');
    }
    try {
      return await this.db.appointment.create({
        data: {
          stylistId: stylist.id,
          clientId,
          service: dto.service.trim(),
          notes: dto.notes?.trim(),
          startsAt,
          status: AppointmentStatus.pending,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ce créneau est déjà réservé. Choisissez un autre horaire.');
      }
      throw error;
    }
  }

  async clientAppointments(clientId: string) {
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

  async stylistAppointments(routeId: string, actorId: string) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    return this.db.appointment.findMany({
      where: { stylistId: stylist.id },
      orderBy: { startsAt: 'asc' },
      include: {
        client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } },
      },
    });
  }

  async updateStylistAppointmentStatus(id: string, actorId: string, status: AppointmentStatus) {
    const appointment = await this.db.appointment.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!appointment) {
      throw new NotFoundException('Rendez-vous introuvable');
    }
    if (appointment.stylist.userId !== actorId) {
      throw new ForbiddenException('Accès interdit à ce rendez-vous');
    }
    try {
      assertAppointmentTransition(appointment.status, status);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Statut invalide');
    }
    if (appointment.status !== status) {
      const result = await this.db.appointment.updateMany({
        where: { id, status: appointment.status },
        data: { status },
      });
      if (!result.count) {
        throw new ConflictException('Ce rendez-vous a été modifié. Actualisez-le.');
      }
    }
    return this.db.appointment.findUniqueOrThrow({
      where: { id },
      include: {
        client: { select: { firstName: true, lastName: true, phone: true, profileImage: true } },
      },
    });
  }
}
