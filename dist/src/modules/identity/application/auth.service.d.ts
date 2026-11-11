import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountRole } from '../domain/account-role';
import { type AccountRecord, type UserRepository } from '../domain/user.repository';
import { ChangeEmployeePasswordDto, LoginDto, RegisterDto, StylistRegisterDto } from './auth.dto';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly config;
    constructor(users: UserRepository, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto | StylistRegisterDto): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: AccountRole;
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
    login(dto: LoginDto, requiredRole?: AccountRole): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: AccountRole;
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
    refresh(token: string): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: AccountRole;
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
    changeEmployeePassword(userId: string, dto: ChangeEmployeePasswordDto): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: AccountRole;
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
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    me(userId: string): Promise<{
        id: string;
        role: AccountRole;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        profileImage: string;
        isActive: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    issueTokens(user: AccountRecord, previousRefreshHash?: string): Promise<{
        token: string;
        refreshToken: string;
        data: {
            id: string;
            role: AccountRole;
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
    private publicUser;
}
