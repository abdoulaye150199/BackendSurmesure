"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const account_role_1 = require("../../../identity/domain/account-role");
const current_user_decorator_1 = require("../../../identity/presentation/current-user.decorator");
const jwt_auth_guard_1 = require("../../../identity/presentation/jwt-auth.guard");
const roles_decorator_1 = require("../../../identity/presentation/roles.decorator");
const roles_guard_1 = require("../../../identity/presentation/roles.guard");
const commerce_dto_1 = require("../../application/commerce.dto");
const commerce_service_1 = require("../../application/commerce.service");
let AdminWorkspaceController = class AdminWorkspaceController {
    service;
    constructor(service) {
        this.service = service;
    }
    dashboard() {
        return this.service.adminDashboard();
    }
    users(query) {
        return this.service.adminUsers(query);
    }
    deleteUser(user, id) {
        return this.service.adminDeleteUser(user.sub, id);
    }
    userStatus(id, user, dto) {
        return this.service.adminSetUserStatus(user.sub, id, dto.active);
    }
    orderStatus(id, dto) {
        return this.service.adminUpdateOrder(id, dto);
    }
};
exports.AdminWorkspaceController = AdminWorkspaceController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminWorkspaceController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commerce_dto_1.AdminUsersQueryDto]),
    __metadata("design:returntype", void 0)
], AdminWorkspaceController.prototype, "users", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminWorkspaceController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.AdminUserStatusDto]),
    __metadata("design:returntype", void 0)
], AdminWorkspaceController.prototype, "userStatus", null);
__decorate([
    (0, common_1.Patch)('orders/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commerce_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], AdminWorkspaceController.prototype, "orderStatus", null);
exports.AdminWorkspaceController = AdminWorkspaceController = __decorate([
    (0, swagger_1.ApiTags)('super admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [commerce_service_1.CommerceService])
], AdminWorkspaceController);
//# sourceMappingURL=admin.controller.js.map