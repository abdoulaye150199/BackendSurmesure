import { DomainError } from '../../../shared/domain/domain-error';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};
export function assertAppointmentTransition(
  current: AppointmentStatus,
  next: AppointmentStatus,
): void {
  if (current !== next && !transitions[current].includes(next)) {
    throw new DomainError(
      `Transition ${current} vers ${next} interdite.`,
      'APPOINTMENT_TRANSITION_INVALID',
    );
  }
}
