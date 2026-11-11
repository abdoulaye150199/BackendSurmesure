import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { CreateEmployeeAccountDto, CreatePersonnelDto, UpdatePersonnelDto } from '../commerce.dto';
import { CommerceAccessService } from './commerce-access.service';
export declare class TeamService {
    private readonly db;
    private readonly access;
    constructor(db: PrismaService, access: CommerceAccessService);
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
}
