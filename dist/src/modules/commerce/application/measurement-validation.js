"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMeasurements = validateMeasurements;
const common_1 = require("@nestjs/common");
const domain_error_1 = require("../../../shared/domain/domain-error");
const measurements_1 = require("../domain/measurements");
function validateMeasurements(value) {
    try {
        (0, measurements_1.assertMeasurements)(value);
    }
    catch (error) {
        if (error instanceof domain_error_1.DomainError) {
            throw new common_1.BadRequestException(error.message);
        }
        throw error;
    }
}
//# sourceMappingURL=measurement-validation.js.map