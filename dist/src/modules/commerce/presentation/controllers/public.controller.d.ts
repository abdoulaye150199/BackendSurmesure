import { PageQueryDto } from '../../../../shared/application/page.dto';
import { CatalogLikeDto } from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';
export declare class PublicController {
    private readonly service;
    constructor(service: CommerceService);
    catalog(query: PageQueryDto): Promise<{
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
    likeCatalog(id: string, dto: CatalogLikeDto): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    catalogItem(id: string): import(".prisma/client").Prisma.Prisma__CatalogItemClient<{
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
    stylists(query: PageQueryDto): import(".prisma/client").Prisma.PrismaPromise<({
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
    home(): Promise<{
        heroTitle: string;
        highlightedCategories: string[];
        catalog: {
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
        }[];
        stylists: ({
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
        })[];
    }>;
}
