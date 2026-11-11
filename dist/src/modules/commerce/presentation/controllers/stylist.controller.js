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
exports.StylistWorkspaceController = void 0;
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
let StylistWorkspaceController = class StylistWorkspaceController {
    service;
    constructor(service) {
        this.service = service;
    }
    orders(id, user, query) {
        return this.service.listOrders(id, user.sub, query);
    }
    linkCandidates(id, user, query) {
        return this.service.clientLinkCandidates(id, user.sub, query.phone);
    }
    linkHistory(id, user, dto) {
        return this.service.linkClientHistory(id, user.sub, dto.clientId, dto.phone);
    }
    addOrder(id, user, dto) {
        return this.service.createOrder(id, user.sub, dto);
    }
    putOrder(id, user, dto) {
        return this.service.updateOrder(id, user.sub, dto);
    }
    patchOrder(id, user, dto) {
        return this.service.updateOrder(id, user.sub, dto);
    }
    notify(id, user, dto) {
        return this.service.notifyOrder(id, user.sub, dto.message);
    }
    deleteOrder(id, user) {
        return this.service.deleteOrder(id, user.sub);
    }
    validateMeasurement(id, user, dto) {
        return this.service.validateMeasurement(id, user.sub, dto);
    }
    measurements(id, user, query) {
        return this.service.listMeasurements(id, user.sub, query.limit, query.cursor);
    }
    appointments(id, user) {
        return this.service.stylistAppointments(id, user.sub);
    }
    updateAppointmentStatus(id, user, dto) {
        return this.service.updateStylistAppointmentStatus(id, user.sub, dto.status);
    }
    searchMeasurements(id, user, query) {
        return this.service.listMeasurements(id, user.sub, query.limit, query.cursor, query.q);
    }
    addMeasurement(id, user, dto) {
        return this.service.createMeasurement(id, user.sub, dto);
    }
    updateMeasurement(id, user, dto) {
        return this.service.updateMeasurement(id, user.sub, dto);
    }
    deleteMeasurement(id, user) {
        return this.service.deleteMeasurement(id, user.sub);
    }
    personnel(id, user) {
        return this.service.listPersonnel(id, user.sub);
    }
    createEmployeeAccount(id, user, dto) {
        return this.service.createEmployeeAccount(id, user.sub, dto);
    }
    setEmployeeAccess(stylist, id, user, dto) {
        return this.service.setEmployeeAccess(stylist, id, user.sub, dto.active);
    }
    removeEmployee(stylist, id, user) {
        return this.service.removeEmployee(stylist, id, user.sub);
    }
    addPersonnel(id, user, dto) {
        return this.service.createPersonnel(id, user.sub, dto);
    }
    updatePersonnel(stylist, id, user, dto) {
        return this.service.updatePersonnel(stylist, id, user.sub, dto);
    }
    deletePersonnel(id, user) {
        return this.service.deletePersonnel(id, user.sub);
    }
    addCatalog(user, dto) {
        return this.service.createCatalog(user.sub, dto);
    }
    updateCatalog(id, user, dto) {
        return this.service.updateCatalog(id, user.sub, dto);
    }
    deleteCatalog(id, user) {
        return this.service.deactivateCatalog(id, user.sub);
    }
    updateProfile(user, dto) {
        return this.service.updateStylistProfile(user.sub, dto);
    }
};
exports.StylistWorkspaceController = StylistWorkspaceController;
__decorate([
    (0, common_1.Get)('stylist/:stylistId/orders'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.OrdersQueryDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "orders", null);
__decorate([
    (0, common_1.Get)('stylist/:stylistId/clients/link-candidates'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.ClientLinkQueryDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "linkCandidates", null);
__decorate([
    (0, common_1.Post)('stylist/:stylistId/clients/link'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.LinkClientHistoryDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "linkHistory", null);
__decorate([
    (0, common_1.Post)('stylist/:stylistId/orders'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "addOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "putOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "patchOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/notify'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.NotifyDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "notify", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "deleteOrder", null);
__decorate([
    (0, common_1.Patch)('measurements/:id/validate'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.ValidateMeasurementDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "validateMeasurement", null);
__decorate([
    (0, common_1.Get)('stylist/:stylistId/measurements'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, page_dto_1.PageQueryDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "measurements", null);
__decorate([
    (0, common_1.Get)('stylist/:stylistId/appointments'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "appointments", null);
__decorate([
    (0, common_1.Patch)('appointments/:id/status'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateAppointmentStatusDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "updateAppointmentStatus", null);
__decorate([
    (0, common_1.Get)('stylist/:stylistId/measurements/search'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.MeasurementsQueryDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "searchMeasurements", null);
__decorate([
    (0, common_1.Post)('stylist/:stylistId/measurements'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.CreateMeasurementDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "addMeasurement", null);
__decorate([
    (0, common_1.Put)('measurements/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateMeasurementDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "updateMeasurement", null);
__decorate([
    (0, common_1.Delete)('measurements/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "deleteMeasurement", null);
__decorate([
    (0, common_1.Get)('stylist/:stylistId/personnel'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "personnel", null);
__decorate([
    (0, common_1.Post)('stylist/:stylistId/personnel/accounts'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.CreateEmployeeAccountDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "createEmployeeAccount", null);
__decorate([
    (0, common_1.Patch)('stylist/:stylistId/personnel/:id/access'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, commerce_dto_1.EmployeeAccessDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "setEmployeeAccess", null);
__decorate([
    (0, common_1.Delete)('stylist/:stylistId/personnel/:id'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "removeEmployee", null);
__decorate([
    (0, common_1.Post)('stylist/:stylistId/personnel'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.CreatePersonnelDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "addPersonnel", null);
__decorate([
    (0, common_1.Put)('stylist/:stylistId/personnel/:id'),
    __param(0, (0, common_1.Param)('stylistId', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, commerce_dto_1.UpdatePersonnelDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "updatePersonnel", null);
__decorate([
    (0, common_1.Delete)('personnel/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "deletePersonnel", null);
__decorate([
    (0, common_1.Post)('catalog'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.CreateCatalogItemDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "addCatalog", null);
__decorate([
    (0, common_1.Patch)('catalog/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, commerce_dto_1.UpdateCatalogItemDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "updateCatalog", null);
__decorate([
    (0, common_1.Delete)('catalog/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "deleteCatalog", null);
__decorate([
    (0, common_1.Put)('stylist/profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commerce_dto_1.UpdateStylistProfileDto]),
    __metadata("design:returntype", void 0)
], StylistWorkspaceController.prototype, "updateProfile", null);
exports.StylistWorkspaceController = StylistWorkspaceController = __decorate([
    (0, swagger_1.ApiTags)('stylist workspace'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.STYLIST),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [commerce_service_1.CommerceService])
], StylistWorkspaceController);
//# sourceMappingURL=stylist.controller.js.map