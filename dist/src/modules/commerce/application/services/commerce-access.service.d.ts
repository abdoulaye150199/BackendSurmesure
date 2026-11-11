import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
export declare class CommerceAccessService {
    private readonly db;
    constructor(db: PrismaService);
    stylistProfile(routeId: string, actorId: string): Promise<{
        id: string;
        businessName: string;
        about: string;
        specialties: string[];
        rating: import("@prisma/client/runtime/library").Decimal;
        userId: string;
    }>;
    employeeProfile(actorId: string): Promise<{
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
    assertClientPhone(clientId: string, phone: string): Promise<void>;
}
