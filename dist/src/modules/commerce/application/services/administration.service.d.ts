import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { AdminUsersQueryDto } from '../dto/administration.dto';
export declare class AdministrationService {
    private readonly db;
    constructor(db: PrismaService);
    adminDashboard(): Promise<{
        summary: {
            users: number;
            clients: number;
            stylists: number;
            orders: number;
            activeOrders: number;
            measurements: number;
            appointments: number;
            catalogItems: number;
            revenue: number | Prisma.Decimal;
        };
        users: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            active: boolean;
            firstName: string;
            lastName: string;
            phone: string;
            profileImage: string;
            createdAt: Date;
            updatedAt: Date;
            stylist: {
                id: string;
                businessName: string;
                specialties: string[];
                rating: Prisma.Decimal;
            } | null;
        }[];
        orders: ({
            client: {
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            stylist: {
                businessName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            measurements: Prisma.JsonValue;
            status: import(".prisma/client").$Enums.OrderStatus;
            stylistId: string;
            notes: string | null;
            currency: string;
            clientId: string | null;
            clientName: string;
            clientPhone: string;
            durationDays: number | null;
            dueAt: Date | null;
            totalPrice: Prisma.Decimal;
            clientConfirmedAt: Date | null;
            completedAt: Date | null;
        })[];
        appointments: ({
            client: {
                email: string;
                firstName: string;
                lastName: string;
                phone: string;
                profileImage: string;
            };
            stylist: {
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
        })[];
        catalog: ({
            stylist: {
                businessName: string;
            };
        } & {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            title: string;
            stylistId: string;
            imageUrl: string;
            price: Prisma.Decimal;
            currency: string;
            availableColors: string[];
        })[];
    }>;
    adminSetUserStatus(actorId: string, id: string, active: boolean): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        active: boolean;
        firstName: string;
        lastName: string;
        phone: string;
        profileImage: string;
        createdAt: Date;
        updatedAt: Date;
        stylist: {
            id: string;
            businessName: string;
            specialties: string[];
            rating: Prisma.Decimal;
        } | null;
    }>;
    adminUsers(query: AdminUsersQueryDto): Promise<{
        meta: {
            total: number;
            page: number;
            totalPages: number;
            nextCursor: string | null;
            hasMore: boolean;
        };
        data: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            active: boolean;
            firstName: string;
            lastName: string;
            phone: string;
            profileImage: string;
            createdAt: Date;
            updatedAt: Date;
            stylist: {
                id: string;
                businessName: string;
                specialties: string[];
                rating: Prisma.Decimal;
            } | null;
        }[];
    }>;
    adminDeleteUser(actorId: string, id: string): Promise<{
        success: boolean;
        id: string;
        deletion: string;
        historyPreserved: boolean;
    }>;
}
