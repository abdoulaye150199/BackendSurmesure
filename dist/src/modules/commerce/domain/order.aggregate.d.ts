export type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'delivered' | 'cancelled';
export declare class OrderAggregate {
    readonly id: string;
    private currentStatus;
    constructor(id: string, currentStatus: OrderStatus);
    get status(): OrderStatus;
    transitionTo(next: OrderStatus): void;
}
