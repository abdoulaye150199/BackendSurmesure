import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CommerceAccessService } from './commerce-access.service';
export declare class ClientHistoryService {
    private readonly db;
    private readonly access;
    constructor(db: PrismaService, access: CommerceAccessService);
    candidates(routeId: string, actorId: string, phoneInput: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    }[]>;
    link(routeId: string, actorId: string, clientId: string, phoneInput: string): Promise<{
        clientId: string;
        orders: number;
        measurements: number;
    }>;
}
