import { PageQueryDto } from '../../../../shared/application/page.dto';
import type { AuthUser } from '../../../identity/presentation/current-user.decorator';
import { CreateAppointmentDto, CreateClientModelMeasurementDto, OrdersQueryDto, SaveClientMeasurementDto } from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';
export declare class ClientWorkspaceController {
    private readonly service;
    constructor(service: CommerceService);
    notifications(user: AuthUser, query: PageQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>>;
    readNotification(id: string, user: AuthUser): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>;
    orders(user: AuthUser, query: OrdersQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    measurements(user: AuthUser): Promise<{
        measurements: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        stylistId: string;
        notes: string;
        clientId: string | null;
        clientName: string;
        clientPhone: string;
        modelName: string | null;
        modelType: string | null;
        clientConfirmedAt: Date | null;
        source: import(".prisma/client").$Enums.MeasurementSource;
        validatedAt: Date | null;
        validatedById: string | null;
    }[]>;
    createModelMeasurements(user: AuthUser, dto: CreateClientModelMeasurementDto): Promise<{
        measurements: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        stylistId: string;
        notes: string;
        clientId: string | null;
        clientName: string;
        clientPhone: string;
        modelName: string | null;
        modelType: string | null;
        clientConfirmedAt: Date | null;
        source: import(".prisma/client").$Enums.MeasurementSource;
        validatedAt: Date | null;
        validatedById: string | null;
    }>;
    saveMeasurements(user: AuthUser, dto: SaveClientMeasurementDto): Promise<{
        measurements: import("@prisma/client/runtime/library").JsonValue;
        values: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        stylistId: string;
        notes: string;
        clientId: string | null;
        clientName: string;
        clientPhone: string;
        modelName: string | null;
        modelType: string | null;
        clientConfirmedAt: Date | null;
        source: import(".prisma/client").$Enums.MeasurementSource;
        validatedAt: Date | null;
        validatedById: string | null;
    }>;
    appointments(user: AuthUser): Promise<({
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
    appointment(user: AuthUser, dto: CreateAppointmentDto): Promise<{
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
}
