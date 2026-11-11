"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestId = createRequestId;
const node_crypto_1 = require("node:crypto");
const class_validator_1 = require("class-validator");
function createRequestId(header) {
    return typeof header === 'string' && (0, class_validator_1.isUUID)(header) ? header : (0, node_crypto_1.randomUUID)();
}
//# sourceMappingURL=request-id.js.map