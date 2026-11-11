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
exports.EmployeeWorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const page_dto_1 = require("../../../../shared/application/page.dto");
const account_role_1 = require("../../../identity/domain/account-role");
const current_user_decorator_1 = require("../../../identity/presentation/current-user.decorator");
const jwt_auth_guard_1 = require("../../../identity/presentation/jwt-auth.guard");
const roles_decorator_1 = require("../../../identity/presentation/roles.decorator");
const roles_guard_1 = require("../../../identity/presentation/roles.guard");
const commerce_dto_1 = require("../../application/commerce.dto");
const commerce_service_1 = require("../../application/commerce.service");
let EmployeeWorkspaceController = class EmployeeWorkspaceController {
    service;
    constructor(service) {
        this.service = service;
    }
    orders(user, query) {
        return this.service.listEmployeeOrders(user.sub, query);
    }
    createOrder(user, dto) {
        return this.service.createEmployeeOrder(user.sub, dto);
    }
    createCatalog(user, dto) {
        return this.service.createEmployeeCatalog(user.sub, dto);
    }
    context(user) {
        return this.service.employeeContext(user.sub);
    }
    measurements(user, query) {
        return this.service.listEmployeeMeasurements(user.sub, query.limit, query.cursor);
    }
    createMeasurement(user, dto) {
        return this.service.createEmployeeMeasurement(user.sub, dto);
    }
    updateMeasurement(id, user, dto) {
        return this.service.updateEmployeeMeasurement(user.sub, id, dto);
    }
};
exports.EmployeeWorkspaceController = EmployeeWorkspaceController;
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.OrdersQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "orders", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('catalog'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateCatalogItemDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "createCatalog", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "context", null);
__decorate([
    (0, common_1.Get)('measurements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, page_dto_1.PageQueryDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "measurements", null);
__decorate([
    (0, common_1.Post)('measurements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateEmployeeMeasurementDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "createMeasurement", null);
__decorate([
    (0, common_1.Put)('measurements/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateMeasurementDto]),
    __metadata("design:returntype", void 0)
], EmployeeWorkspaceController.prototype, "updateMeasurement", null);
exports.EmployeeWorkspaceController = EmployeeWorkspaceController = __decorate([
    (0, swagger_1.ApiTags)('employee workspace'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.EMPLOYEE),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [commerce_service_1.CommerceService])
], EmployeeWorkspaceController);
//# sourceMappingURL=employee.controller.js.map