import { OrderStatus } from '@prisma/client';
import { PageQueryDto } from '../../../../shared/application/page.dto';
export declare class OrdersQueryDto extends PageQueryDto {
    status?: OrderStatus;
}
export declare class CreateOrderDto {
    measurements?: Record<string, number>;
    durationDays?: number;
    dueAt?: string;
    clientId?: string;
    clientName: string;
    clientPhone: string;
    description: string;
    totalPrice: number;
    notes?: string;
}
export declare class UpdateOrderDto {
    description?: string;
    status?: OrderStatus;
    totalPrice?: number;
    notes?: string;
}
export declare class NotifyDto {
    message: string;
}
