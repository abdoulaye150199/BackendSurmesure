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
exports.ClientWorkspaceController = void 0;
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
let ClientWorkspaceController = class ClientWorkspaceController {
    service;
    constructor(service) {
        this.service = service;
    }
    notifications(user, query) {
        return this.service.clientNotifications(user.sub, query);
    }
    readNotification(id, user) {
        return this.service.readClientNotification(user.sub, id);
    }
    orders(user, query) {
        return this.service.clientOrders(user.sub, query);
    }
    measurements(user) {
        return this.service.clientMeasurements(user.sub);
    }
    createModelMeasurements(user, dto) {
        return this.service.createClientModelMeasurements(user.sub, dto);
    }
    saveMeasurements(user, dto) {
        return this.service.saveClientMeasurements(user.sub, dto);
    }
    appointments(user) {
        return this.service.clientAppointments(user.sub);
    }
    appointment(user, dto) {
        return this.service.createAppointment(user.sub, dto);
    }
};
exports.ClientWorkspaceController = ClientWorkspaceController;
__decorate([
    (0, common_1.Get)('client/notifications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, page_dto_1.PageQueryDto]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "notifications", null);
__decorate([
    (0, common_1.Patch)('client/notifications/:id/read'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "readNotification", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.OrdersQueryDto]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "orders", null);
__decorate([
    (0, common_1.Get)('measurements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "measurements", null);
__decorate([
    (0, common_1.Post)('client/measurements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateClientModelMeasurementDto]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "createModelMeasurements", null);
__decorate([
    (0, common_1.Put)('client/measurements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.SaveClientMeasurementDto]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "saveMeasurements", null);
__decorate([
    (0, common_1.Get)('appointments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "appointments", null);
__decorate([
    (0, common_1.Post)('appointments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", void 0)
], ClientWorkspaceController.prototype, "appointment", null);
exports.ClientWorkspaceController = ClientWorkspaceController = __decorate([
    (0, swagger_1.ApiTags)('client workspace'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.CLIENT),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [commerce_service_1.CommerceService])
], ClientWorkspaceController);
//# sourceMappingURL=client.controller.js.map