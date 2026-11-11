export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}
export declare class StylistRegisterDto {
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    phone: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class GoogleLoginDto {
    credential: string;
}
export declare class GoogleRegisterDto extends GoogleLoginDto {
    role: 'client' | 'stylist';
    firstName: string;
    lastName: string;
    phone: string;
    businessName?: string;
}
export declare class ChangeEmployeePasswordDto {
    currentPassword: string;
    newPassword: string;
}
