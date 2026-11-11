"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAggregate = void 0;
const domain_error_1 = require("../../../shared/domain/domain-error");
const transitions = {
    pending: ['inProgress', 'cancelled'],
    inProgress: ['completed', 'cancelled'],
    completed: ['delivered'],
    delivered: [],
    cancelled: [],
};
class OrderAggregate {
    id;
    currentStatus;
    constructor(id, currentStatus) {
        this.id = id;
        this.currentStatus = currentStatus;
    }
    get status() {
        return this.currentStatus;
    }
    transitionTo(next) {
        if (next === this.currentStatus) {
            return;
        }
        if (!transitions[this.currentStatus].includes(next)) {
            throw new domain_error_1.DomainError(`Transition ${this.currentStatus} -> ${next} interdite`, 'ORDER_STATUS_TRANSITION_INVALID');
        }
        this.currentStatus = next;
    }
}
exports.OrderAggregate = OrderAggregate;
//# sourceMappingURL=order.aggregate.js.map