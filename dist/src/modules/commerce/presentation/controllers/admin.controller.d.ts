import type { AuthUser } from '../../../identity/presentation/current-user.decorator';
import { AdminUsersQueryDto, AdminUserStatusDto, UpdateOrderDto } from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';
export declare class AdminWorkspaceController {
    private readonly service;
    constructor(service: CommerceService);
    dashboard(): Promise<{
        summary: {
            users: number;
            clients: number;
            stylists: number;
            orders: number;
            activeOrders: number;
            measurements: number;
            appointments: number;
            catalogItems: number;
            revenue: number | import("@prisma/client/runtime/library").Decimal;
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
                rating: import("@prisma/client/runtime/library").Decimal;
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
            measurements: import("@prisma/client/runtime/library").JsonValue;
            status: import(".prisma/client").$Enums.OrderStatus;
            stylistId: string;
            notes: string | null;
            currency: string;
            clientId: string | null;
            clientName: string;
            clientPhone: string;
            durationDays: number | null;
            dueAt: Date | null;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
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
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            availableColors: string[];
        })[];
    }>;
    users(query: AdminUsersQueryDto): Promise<{
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
                rating: import("@prisma/client/runtime/library").Decimal;
            } | null;
        }[];
    }>;
    deleteUser(user: AuthUser, id: string): Promise<{
        success: boolean;
        id: string;
        deletion: string;
        historyPreserved: boolean;
    }>;
    userStatus(id: string, user: AuthUser, dto: AdminUserStatusDto): Promise<{
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
            rating: import("@prisma/client/runtime/library").Decimal;
        } | null;
    }>;
    orderStatus(id: string, dto: UpdateOrderDto): Promise<{
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
        measurements: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.OrderStatus;
        stylistId: string;
        notes: string | null;
        currency: string;
        clientId: string | null;
        clientName: string;
        clientPhone: string;
        durationDays: number | null;
        dueAt: Date | null;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        clientConfirmedAt: Date | null;
        completedAt: Date | null;
    }>;
}
