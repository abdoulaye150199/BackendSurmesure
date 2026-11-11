"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../identity/auth.module");
const commerce_service_1 = require("./application/commerce.service");
const administration_service_1 = require("./application/services/administration.service");
const appointments_service_1 = require("./application/services/appointments.service");
const catalog_service_1 = require("./application/services/catalog.service");
const client_history_service_1 = require("./application/services/client-history.service");
const commerce_access_service_1 = require("./application/services/commerce-access.service");
const measurements_service_1 = require("./application/services/measurements.service");
const notifications_service_1 = require("./application/services/notifications.service");
const orders_service_1 = require("./application/services/orders.service");
const profiles_service_1 = require("./application/services/profiles.service");
const team_service_1 = require("./application/services/team.service");
const commerce_controller_1 = require("./presentation/commerce.controller");
let CommerceModule = class CommerceModule {
};
exports.CommerceModule = CommerceModule;
exports.CommerceModule = CommerceModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        providers: [
            client_history_service_1.ClientHistoryService,
            notifications_service_1.NotificationsService,
            commerce_service_1.CommerceService,
            commerce_access_service_1.CommerceAccessService,
            orders_service_1.OrdersService,
            measurements_service_1.MeasurementsService,
            team_service_1.TeamService,
            catalog_service_1.CatalogService,
            profiles_service_1.ProfilesService,
            appointments_service_1.AppointmentsService,
            administration_service_1.AdministrationService,
        ],
        controllers: [
            commerce_controller_1.PublicController,
            commerce_controller_1.ClientWorkspaceController,
            commerce_controller_1.StylistWorkspaceController,
            commerce_controller_1.EmployeeWorkspaceController,
            commerce_controller_1.AdminWorkspaceController,
        ],
    })
], CommerceModule);
//# sourceMappingURL=commerce.module.js.map