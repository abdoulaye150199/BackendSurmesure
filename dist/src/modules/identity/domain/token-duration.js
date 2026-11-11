"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDurationSeconds = tokenDurationSeconds;
function tokenDurationSeconds(value) {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) {
        throw new Error('Durée JWT invalide : utilisez un entier positif suivi de s, m, h ou d.');
    }
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const seconds = Number(match[1]) * units[match[2]];
    if (!Number.isSafeInteger(seconds) || seconds <= 0 || seconds > 365 * 86400) {
        throw new Error('Durée JWT hors limites.');
    }
    return seconds;
}
//# sourceMappingURL=token-duration.js.map