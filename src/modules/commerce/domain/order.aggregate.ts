import { OrderStatus } from '@prisma/client';
import { DomainError } from '../../../shared/domain/domain-error';

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['inProgress', 'cancelled'],
  inProgress: ['completed', 'cancelled'],
  completed: ['delivered'],
  delivered: [],
  cancelled: [],
};

/** Aggregate métier pur : protège le cycle de vie d'une commande. */
export class OrderAggregate {
  constructor(readonly id: string, private currentStatus: OrderStatus) {}
  get status() { return this.currentStatus; }
  transitionTo(next: OrderStatus) {
    if (next === this.currentStatus) return;
    if (!transitions[this.currentStatus].includes(next)) throw new DomainError(`Transition ${this.currentStatus} -> ${next} interdite`, 'ORDER_STATUS_TRANSITION_INVALID');
    this.currentStatus = next;
  }
}
