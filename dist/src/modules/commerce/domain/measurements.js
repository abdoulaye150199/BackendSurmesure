"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_MEASUREMENT_CM = exports.MAX_MEASUREMENTS = void 0;
exports.assertMeasurements = assertMeasurements;
const domain_error_1 = require("../../../shared/domain/domain-error");
exports.MAX_MEASUREMENTS = 50;
exports.MAX_MEASUREMENT_CM = 300;
function assertMeasurements(values) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
        throw new domain_error_1.DomainError('Les mensurations doivent être un objet de mesures numériques.', 'MEASUREMENTS_INVALID');
    }
    const entries = Object.entries(values);
    if (!entries.length ||
        entries.length > exports.MAX_MEASUREMENTS ||
        entries.some(([key, value]) => !key.trim() ||
            ['__proto__', 'constructor', 'prototype'].includes(key) ||
            key.length > 80 ||
            typeof value !== 'number' ||
            !Number.isFinite(value) ||
            value <= 0 ||
            value > exports.MAX_MEASUREMENT_CM)) {
        throw new domain_error_1.DomainError('Renseignez de 1 à 50 mesures numériques entre 0 et 300 cm (zéro exclu).', 'MEASUREMENTS_INVALID');
    }
}
//# sourceMappingURL=measurements.js.map