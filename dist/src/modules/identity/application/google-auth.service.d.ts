import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthService } from './auth.service';
import { GoogleRegisterDto } from './auth.dto';
export declare class GoogleAuthService {
    private readonly config;
    private readonly db;
    private readonly auth;
    private readonly google;
    constructor(config: ConfigService, db: PrismaService, auth: AuthService);
    configuration(): {
        clientId: string | null;
    };
    private verify;
    login(credential: string): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: import("../domain/account-role").AccountRole;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            profileImage: string;
            isActive: boolean;
            mustChangePassword: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    register(dto: GoogleRegisterDto): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: import("../domain/account-role").AccountRole;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            profileImage: string;
            isActive: boolean;
            mustChangePassword: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
