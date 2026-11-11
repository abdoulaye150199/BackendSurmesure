import { PageQueryDto } from '../../../../shared/application/page.dto';
export declare class AdminUserStatusDto {
    active: boolean;
}
export declare class AdminUsersQueryDto extends PageQueryDto {
    page?: number;
    search?: string;
    role?: 'CLIENT' | 'STYLIST' | 'EMPLOYEE' | 'ADMIN';
}
