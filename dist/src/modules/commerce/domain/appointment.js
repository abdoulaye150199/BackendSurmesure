"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAppointmentTransition = assertAppointmentTransition;
const domain_error_1 = require("../../../shared/domain/domain-error");
const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};
function assertAppointmentTransition(current, next) {
    if (current !== next && !transitions[current].includes(next)) {
        throw new domain_error_1.DomainError(`Transition ${current} vers ${next} interdite.`, 'APPOINTMENT_TRANSITION_INVALID');
    }
}
//# sourceMappingURL=appointment.js.map