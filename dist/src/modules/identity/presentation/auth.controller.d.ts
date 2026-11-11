import { ChangeEmployeePasswordDto, LoginDto, RefreshDto, RegisterDto, StylistRegisterDto, GoogleLoginDto, GoogleRegisterDto } from '../application/auth.dto';
import { AuthService } from '../application/auth.service';
import { GoogleAuthService } from '../application/google-auth.service';
import { AccountRole } from '../domain/account-role';
import type { AuthUser } from './current-user.decorator';
export declare class AuthController {
    private readonly auth;
    private readonly google;
    constructor(auth: AuthService, google: GoogleAuthService);
    googleConfig(): {
        clientId: string | null;
    };
    googleLogin(dto: GoogleLoginDto): Promise<{
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
    googleRegister(dto: GoogleRegisterDto): Promise<{
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
    register(dto: RegisterDto): Promise<{
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
    login(dto: LoginDto): Promise<{
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
    clientLogin(dto: LoginDto): Promise<{
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
    stylistSignup(dto: StylistRegisterDto): Promise<{
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
    stylistLogin(dto: LoginDto): Promise<{
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
    employeeLogin(dto: LoginDto): Promise<{
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
    adminLogin(dto: LoginDto): Promise<{
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
    changeEmployeePassword(user: AuthUser, dto: ChangeEmployeePasswordDto): Promise<{
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
    refresh(dto: RefreshDto): Promise<{
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
    me(user: AuthUser): Promise<{
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
    stylistMe(user: AuthUser): Promise<{
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
    adminMe(user: AuthUser): Promise<{
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
    logout(user: AuthUser): Promise<{
        success: boolean;
    }>;
    stylistLogout(user: AuthUser): Promise<{
        success: boolean;
    }>;
}
