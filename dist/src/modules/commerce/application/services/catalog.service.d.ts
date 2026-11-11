import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from '../commerce.dto';
import { CommerceAccessService } from './commerce-access.service';
export declare class CatalogService {
    private readonly db;
    private readonly access;
    constructor(db: PrismaService, access: CommerceAccessService);
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
}
