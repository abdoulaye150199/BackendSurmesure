export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export declare function assertAppointmentTransition(current: AppointmentStatus, next: AppointmentStatus): void;
