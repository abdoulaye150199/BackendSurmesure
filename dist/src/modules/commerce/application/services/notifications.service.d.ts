import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PageQueryDto } from '../../../../shared/application/page.dto';
export declare class NotificationsService {
    private readonly db;
    constructor(db: PrismaService);
    list(clientId: string, query: PageQueryDto): Promise<import("../../../../shared/application/page.dto").CursorPage<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>>;
    markRead(clientId: string, id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        clientId: string;
        orderId: string | null;
        readAt: Date | null;
    }>;
}
