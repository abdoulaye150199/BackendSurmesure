"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountConflictError = exports.USER_REPOSITORY = void 0;
exports.USER_REPOSITORY = Symbol('USER_REPOSITORY');
class AccountConflictError extends Error {
    constructor() {
        super('Cet e-mail ou ce numéro est déjà associé à un compte.');
    }
}
exports.AccountConflictError = AccountConflictError;
//# sourceMappingURL=user.repository.js.map