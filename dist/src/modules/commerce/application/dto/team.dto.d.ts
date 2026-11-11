export declare class CreateEmployeeAccountDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    specialization: string;
}
export declare class CreatePersonnelDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialization: string;
}
export declare class UpdatePersonnelDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    active?: boolean;
}
export declare class EmployeeAccessDto {
    active: boolean;
}
