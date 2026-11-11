import { AppointmentStatus } from '@prisma/client';
export declare class UpdateAppointmentStatusDto {
    status: AppointmentStatus;
}
export declare class CreateAppointmentDto {
    stylistId: string;
    service: string;
    startsAt: string;
    notes?: string;
}
