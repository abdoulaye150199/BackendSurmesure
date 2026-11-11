"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(rows, limit) {
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    return { data, meta: { hasMore, nextCursor: hasMore ? data.at(-1).id : null } };
}
//# sourceMappingURL=pagination.js.map