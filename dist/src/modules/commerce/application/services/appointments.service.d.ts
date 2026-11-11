import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { CreateAppointmentDto } from '../commerce.dto';
import { CommerceAccessService } from './commerce-access.service';
export declare class AppointmentsService {
    private readonly db;
    private readonly access;
    constructor(db: PrismaService, access: CommerceAccessService);
    createAppointment(clientId: string, dto: CreateAppointmentDto): Promise<{
        stylist: {
            user: {
                firstName: string;
                lastName: string;
                profileImage: string;
            };
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        stylistId: string;
        service: string;
        startsAt: Date;
        notes: string | null;
        clientId: string;
    }>;
    clientAppointments(clientId: string): Promise<({
        stylist: {
            user: {
                firstName: string;
                lastName: string;
                profileImage: string;
            };
            businessName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        stylistId: string;
        service: string;
        startsAt: Date;
        notes: string | null;
        clientId: string;
    })[]>;
    stylistAppointments(routeId: string, actorId: string): Promise<({
        client: {
            firstName: string;
            lastName: string;
            phone: string;
            profileImage: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        stylistId: string;
        service: string;
        startsAt: Date;
        notes: string | null;
        clientId: string;
    })[]>;
    updateStylistAppointmentStatus(id: string, actorId: string, status: AppointmentStatus): Promise<{
        client: {
            firstName: string;
            lastName: string;
            phone: string;
            profileImage: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        stylistId: string;
        service: string;
        startsAt: Date;
        notes: string | null;
        clientId: string;
    }>;
}
