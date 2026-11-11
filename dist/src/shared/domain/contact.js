"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalPhone = canonicalPhone;
function canonicalPhone(phone) {
    return phone.replace(/[\s().-]/g, '');
}
//# sourceMappingURL=contact.js.map