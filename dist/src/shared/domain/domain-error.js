"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain-error.js.map