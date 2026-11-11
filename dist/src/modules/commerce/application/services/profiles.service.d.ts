import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { UpdateStylistProfileDto } from '../commerce.dto';
export declare class ProfilesService {
    private readonly db;
    constructor(db: PrismaService);
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
}
