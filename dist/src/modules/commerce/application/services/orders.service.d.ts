import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { CreateOrderDto, OrdersQueryDto, UpdateOrderDto } from '../commerce.dto';
import { CommerceAccessService } from './commerce-access.service';
export declare class OrdersService {
    private readonly db;
    private readonly access;
    constructor(db: PrismaService, access: CommerceAccessService);
    listOrders(routeId: string, actorId: string, query: OrdersQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    }>>;
    createOrder(routeId: string, actorId: string, dto: CreateOrderDto): Promise<{
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
    createEmployeeOrder(actorId: string, dto: CreateOrderDto): Promise<{
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
    listEmployeeOrders(actorId: string, query: OrdersQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    }>>;
    private persistOrder;
    updateOrder(id: string, actorId: string, dto: UpdateOrderDto): Promise<{
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
    private persistUpdate;
    deleteOrder(id: string, actorId: string): Promise<{
        success: boolean;
    }>;
    notifyOrder(id: string, actorId: string, message: string): Promise<{
        success: boolean;
        queued: boolean;
        channel: string;
        notificationId: string;
    }>;
    private assertOrder;
    clientOrders(clientId: string, query: OrdersQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    }>>;
    adminUpdateOrder(id: string, dto: UpdateOrderDto): Promise<{
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
