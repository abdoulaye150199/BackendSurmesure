import { PageQueryDto } from '../../../../shared/application/page.dto';
import type { AuthUser } from '../../../identity/presentation/current-user.decorator';
import { ClientLinkQueryDto, CreateCatalogItemDto, CreateEmployeeAccountDto, CreateMeasurementDto, CreateOrderDto, CreatePersonnelDto, EmployeeAccessDto, LinkClientHistoryDto, MeasurementsQueryDto, NotifyDto, OrdersQueryDto, UpdateAppointmentStatusDto, UpdateCatalogItemDto, UpdateMeasurementDto, UpdateOrderDto, UpdatePersonnelDto, UpdateStylistProfileDto, ValidateMeasurementDto } from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';
export declare class StylistWorkspaceController {
    private readonly service;
    constructor(service: CommerceService);
    orders(id: string, user: AuthUser, query: OrdersQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    linkCandidates(id: string, user: AuthUser, query: ClientLinkQueryDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    }[]>;
    linkHistory(id: string, user: AuthUser, dto: LinkClientHistoryDto): Promise<{
        clientId: string;
        orders: number;
        measurements: number;
    }>;
    addOrder(id: string, user: AuthUser, dto: CreateOrderDto): Promise<{
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
    putOrder(id: string, user: AuthUser, dto: UpdateOrderDto): Promise<{
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
    patchOrder(id: string, user: AuthUser, dto: UpdateOrderDto): Promise<{
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
    notify(id: string, user: AuthUser, dto: NotifyDto): Promise<{
        success: boolean;
        queued: boolean;
        channel: string;
        notificationId: string;
    }>;
    deleteOrder(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    validateMeasurement(id: string, user: AuthUser, dto: ValidateMeasurementDto): Promise<{
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
    measurements(id: string, user: AuthUser, query: PageQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    }>>;
    appointments(id: string, user: AuthUser): Promise<({
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
    updateAppointmentStatus(id: string, user: AuthUser, dto: UpdateAppointmentStatusDto): Promise<{
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
    searchMeasurements(id: string, user: AuthUser, query: MeasurementsQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
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
    }>>;
    addMeasurement(id: string, user: AuthUser, dto: CreateMeasurementDto): Promise<{
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
    updateMeasurement(id: string, user: AuthUser, dto: UpdateMeasurementDto): Promise<{
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
    deleteMeasurement(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    personnel(id: string, user: AuthUser): Promise<({
        user: {
            id: string;
            email: string;
            active: boolean;
        } | null;
    } & {
        id: string;
        email: string;
        active: boolean;
        firstName: string;
        lastName: string;
        phone: string;
        stylistId: string;
        specialization: string;
        userId: string | null;
        hireDate: Date;
    })[]>;
    createEmployeeAccount(id: string, user: AuthUser, dto: CreateEmployeeAccountDto): Promise<{
        user: {
            id: string;
            email: string;
            active: boolean;
        } | null;
    } & {
        id: string;
        email: string;
        active: boolean;
        firstName: string;
        lastName: string;
        phone: string;
        stylistId: string;
        specialization: string;
        userId: string | null;
        hireDate: Date;
    }>;
    setEmployeeAccess(stylist: string, id: string, user: AuthUser, dto: EmployeeAccessDto): Promise<{
        success: boolean;
        active: boolean;
    }>;
    removeEmployee(stylist: string, id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    addPersonnel(id: string, user: AuthUser, dto: CreatePersonnelDto): Promise<{
        id: string;
        email: string;
        active: boolean;
        firstName: string;
        lastName: string;
        phone: string;
        stylistId: string;
        specialization: string;
        userId: string | null;
        hireDate: Date;
    }>;
    updatePersonnel(stylist: string, id: string, user: AuthUser, dto: UpdatePersonnelDto): Promise<{
        id: string;
        email: string;
        active: boolean;
        firstName: string;
        lastName: string;
        phone: string;
        stylistId: string;
        specialization: string;
        userId: string | null;
        hireDate: Date;
    }>;
    deletePersonnel(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    addCatalog(user: AuthUser, dto: CreateCatalogItemDto): Promise<{
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
    }>;
    updateCatalog(id: string, user: AuthUser, dto: UpdateCatalogItemDto): Promise<{
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
    }>;
    deleteCatalog(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
    updateProfile(user: AuthUser, dto: UpdateStylistProfileDto): Promise<{
        user: {
            firstName: string;
            lastName: string;
            profileImage: string;
        };
    } & {
        id: string;
        businessName: string;
        about: string;
        specialties: string[];
        rating: import("@prisma/client/runtime/library").Decimal;
        userId: string;
    }>;
}
