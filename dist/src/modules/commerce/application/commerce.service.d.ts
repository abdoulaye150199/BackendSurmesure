import type { AppointmentStatus } from '@prisma/client';
import { PageQueryDto } from '../../../shared/application/page.dto';
import { AdminUsersQueryDto, CreateAppointmentDto, CreateCatalogItemDto, CreateClientModelMeasurementDto, CreateEmployeeAccountDto, CreateEmployeeMeasurementDto, CreateMeasurementDto, CreateOrderDto, CreatePersonnelDto, OrdersQueryDto, SaveClientMeasurementDto, UpdateCatalogItemDto, UpdateMeasurementDto, UpdateOrderDto, UpdatePersonnelDto, UpdateStylistProfileDto, ValidateMeasurementDto } from './commerce.dto';
import { ClientHistoryService } from './services/client-history.service';
import { CommerceAccessService } from './services/commerce-access.service';
import { NotificationsService } from './services/notifications.service';
import { AdministrationService } from './services/administration.service';
import { AppointmentsService } from './services/appointments.service';
import { CatalogService } from './services/catalog.service';
import { MeasurementsService } from './services/measurements.service';
import { OrdersService } from './services/orders.service';
import { ProfilesService } from './services/profiles.service';
import { TeamService } from './services/team.service';
export declare class CommerceService {
    private readonly history;
    private readonly notifications;
    private readonly access;
    private readonly orders;
    private readonly measurements;
    private readonly team;
    private readonly catalog;
    private readonly profiles;
    private readonly appointments;
    private readonly administration;
    constructor(history: ClientHistoryService, notifications: NotificationsService, access: CommerceAccessService, orders: OrdersService, measurements: MeasurementsService, team: TeamService, catalog: CatalogService, profiles: ProfilesService, appointments: AppointmentsService, administration: AdministrationService);
    listOrders(routeId: string, actorId: string, query: OrdersQueryDto): Promise<import("../../../shared/application/page.dto").CursorPage<{
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
    listEmployeeOrders(actorId: string, query: OrdersQueryDto): Promise<import("../../../shared/application/page.dto").CursorPage<{
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
    deleteOrder(id: string, actorId: string): Promise<{
        success: boolean;
    }>;
    notifyOrder(id: string, actorId: string, message: string): Promise<{
        success: boolean;
        queued: boolean;
        channel: string;
        notificationId: string;
    }>;
    clientOrders(clientId: string, query: OrdersQueryDto): Promise<import("../../../shared/application/page.dto").CursorPage<{
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
    listMeasurements(routeId: string, actorId: string, limit: number, cursor?: string, query?: string): Promise<import("../../../shared/application/page.dto").CursorPage<{
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
    createMeasurement(routeId: string, actorId: string, dto: CreateMeasurementDto): Promise<{
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
    updateMeasurement(id: string, actorId: string, dto: UpdateMeasurementDto): Promise<{
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
    validateMeasurement(id: string, actorId: string, dto: ValidateMeasurementDto): Promise<{
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
    deleteMeasurement(id: string, actorId: string): Promise<{
        success: boolean;
    }>;
    listEmployeeMeasurements(actorId: string, limit: number, cursor?: string): Promise<import("../../../shared/application/page.dto").CursorPage<{
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
    createEmployeeMeasurement(actorId: string, dto: CreateEmployeeMeasurementDto): Promise<{
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
    updateEmployeeMeasurement(actorId: string, id: string, dto: UpdateMeasurementDto): Promise<{
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
    clientMeasurements(clientId: string): Promise<{
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
    saveClientMeasurements(clientId: string, dto: SaveClientMeasurementDto): Promise<{
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
    createClientModelMeasurements(clientId: string, dto: CreateClientModelMeasurementDto): Promise<{
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
    listPersonnel(routeId: string, actorId: string): Promise<({
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
    createEmployeeAccount(routeId: string, actorId: string, dto: CreateEmployeeAccountDto): Promise<{
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
    setEmployeeAccess(routeId: string, personnelId: string, actorId: string, active: boolean): Promise<{
        success: boolean;
        active: boolean;
    }>;
    removeEmployee(routeId: string, personnelId: string, actorId: string): Promise<{
        success: boolean;
    }>;
    createPersonnel(routeId: string, actorId: string, dto: CreatePersonnelDto): Promise<{
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
    updatePersonnel(routeId: string, id: string, actorId: string, dto: UpdatePersonnelDto): Promise<{
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
    deletePersonnel(id: string, actorId: string): Promise<{
        success: boolean;
    }>;
    createEmployeeCatalog(actorId: string, dto: CreateCatalogItemDto): Promise<{
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
    listCatalog(limit: number, cursor?: string): Promise<{
        likesCount: number;
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
    }[]>;
    setCatalogLike(id: string, visitorId: string, liked: boolean): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    getCatalog(id: string): import(".prisma/client").Prisma.Prisma__CatalogItemClient<{
        stylist: {
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createCatalog(actorId: string, dto: CreateCatalogItemDto): Promise<{
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
    updateCatalog(id: string, actorId: string, dto: UpdateCatalogItemDto): Promise<{
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
    deactivateCatalog(id: string, actorId: string): Promise<{
        success: boolean;
    }>;
    updateStylistProfile(actorId: string, dto: UpdateStylistProfileDto): Promise<{
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
    listStylists(limit: number, cursor?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
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
                rating: import("@prisma/client/runtime/library").Decimal;
            } | null;
        }[];
    }>;
    adminDeleteUser(actorId: string, id: string): Promise<{
        success: boolean;
        id: string;
        deletion: string;
        historyPreserved: boolean;
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
            rating: import("@prisma/client/runtime/library").Decimal;
        } | null;
    }>;
    employeeContext(actorId: string): Promise<{
        stylist: {
            id: string;
            businessName: string;
        };
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
    clientLinkCandidates(routeId: string, actorId: string, phone: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    }[]>;
    linkClientHistory(routeId: string, actorId: string, clientId: string, phone: string): Promise<{
        clientId: string;
        orders: number;
        measurements: number;
    }>;
    clientNotifications(clientId: string, query: PageQueryDto): Promise<import("../../../shared/application/page.dto").CursorPage<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>>;
    readClientNotification(clientId: string, id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>;
}
