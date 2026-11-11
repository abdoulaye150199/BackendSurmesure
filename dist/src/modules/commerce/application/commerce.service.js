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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceService = void 0;
const common_1 = require("@nestjs/common");
const client_history_service_1 = require("./services/client-history.service");
const commerce_access_service_1 = require("./services/commerce-access.service");
const notifications_service_1 = require("./services/notifications.service");
const administration_service_1 = require("./services/administration.service");
const appointments_service_1 = require("./services/appointments.service");
const catalog_service_1 = require("./services/catalog.service");
const measurements_service_1 = require("./services/measurements.service");
const orders_service_1 = require("./services/orders.service");
const profiles_service_1 = require("./services/profiles.service");
const team_service_1 = require("./services/team.service");
let CommerceService = class CommerceService {
    history;
    notifications;
    access;
    orders;
    measurements;
    team;
    catalog;
    profiles;
    appointments;
    administration;
    constructor(history, notifications, access, orders, measurements, team, catalog, profiles, appointments, administration) {
        this.history = history;
        this.notifications = notifications;
        this.access = access;
        this.orders = orders;
        this.measurements = measurements;
        this.team = team;
        this.catalog = catalog;
        this.profiles = profiles;
        this.appointments = appointments;
        this.administration = administration;
    }
    listOrders(routeId, actorId, query) {
        return this.orders.listOrders(routeId, actorId, query);
    }
    createOrder(routeId, actorId, dto) {
        return this.orders.createOrder(routeId, actorId, dto);
    }
    createEmployeeOrder(actorId, dto) {
        return this.orders.createEmployeeOrder(actorId, dto);
    }
    listEmployeeOrders(actorId, query) {
        return this.orders.listEmployeeOrders(actorId, query);
    }
    updateOrder(id, actorId, dto) {
        return this.orders.updateOrder(id, actorId, dto);
    }
    deleteOrder(id, actorId) {
        return this.orders.deleteOrder(id, actorId);
    }
    notifyOrder(id, actorId, message) {
        return this.orders.notifyOrder(id, actorId, message);
    }
    clientOrders(clientId, query) {
        return this.orders.clientOrders(clientId, query);
    }
    adminUpdateOrder(id, dto) {
        return this.orders.adminUpdateOrder(id, dto);
    }
    listMeasurements(routeId, actorId, limit, cursor, query) {
        return this.measurements.listMeasurements(routeId, actorId, limit, cursor, query);
    }
    createMeasurement(routeId, actorId, dto) {
        return this.measurements.createMeasurement(routeId, actorId, dto);
    }
    updateMeasurement(id, actorId, dto) {
        return this.measurements.updateMeasurement(id, actorId, dto);
    }
    validateMeasurement(id, actorId, dto) {
        return this.measurements.validateMeasurement(id, actorId, dto);
    }
    deleteMeasurement(id, actorId) {
        return this.measurements.deleteMeasurement(id, actorId);
    }
    listEmployeeMeasurements(actorId, limit, cursor) {
        return this.measurements.listEmployeeMeasurements(actorId, limit, cursor);
    }
    createEmployeeMeasurement(actorId, dto) {
        return this.measurements.createEmployeeMeasurement(actorId, dto);
    }
    updateEmployeeMeasurement(actorId, id, dto) {
        return this.measurements.updateEmployeeMeasurement(actorId, id, dto);
    }
    clientMeasurements(clientId) {
        return this.measurements.clientMeasurements(clientId);
    }
    saveClientMeasurements(clientId, dto) {
        return this.measurements.saveClientMeasurements(clientId, dto);
    }
    createClientModelMeasurements(clientId, dto) {
        return this.measurements.createClientModelMeasurements(clientId, dto);
    }
    listPersonnel(routeId, actorId) {
        return this.team.listPersonnel(routeId, actorId);
    }
    createEmployeeAccount(routeId, actorId, dto) {
        return this.team.createEmployeeAccount(routeId, actorId, dto);
    }
    setEmployeeAccess(routeId, personnelId, actorId, active) {
        return this.team.setEmployeeAccess(routeId, personnelId, actorId, active);
    }
    removeEmployee(routeId, personnelId, actorId) {
        return this.team.removeEmployee(routeId, personnelId, actorId);
    }
    createPersonnel(routeId, actorId, dto) {
        return this.team.createPersonnel(routeId, actorId, dto);
    }
    updatePersonnel(routeId, id, actorId, dto) {
        return this.team.updatePersonnel(routeId, id, actorId, dto);
    }
    deletePersonnel(id, actorId) {
        return this.team.deletePersonnel(id, actorId);
    }
    createEmployeeCatalog(actorId, dto) {
        return this.catalog.createEmployeeCatalog(actorId, dto);
    }
    listCatalog(limit, cursor) {
        return this.catalog.listCatalog(limit, cursor);
    }
    setCatalogLike(id, visitorId, liked) {
        return this.catalog.setCatalogLike(id, visitorId, liked);
    }
    getCatalog(id) {
        return this.catalog.getCatalog(id);
    }
    createCatalog(actorId, dto) {
        return this.catalog.createCatalog(actorId, dto);
    }
    updateCatalog(id, actorId, dto) {
        return this.catalog.updateCatalog(id, actorId, dto);
    }
    deactivateCatalog(id, actorId) {
        return this.catalog.deactivateCatalog(id, actorId);
    }
    updateStylistProfile(actorId, dto) {
        return this.profiles.updateStylistProfile(actorId, dto);
    }
    listStylists(limit, cursor) {
        return this.profiles.listStylists(limit, cursor);
    }
    createAppointment(clientId, dto) {
        return this.appointments.createAppointment(clientId, dto);
    }
    clientAppointments(clientId) {
        return this.appointments.clientAppointments(clientId);
    }
    stylistAppointments(routeId, actorId) {
        return this.appointments.stylistAppointments(routeId, actorId);
    }
    updateStylistAppointmentStatus(id, actorId, status) {
        return this.appointments.updateStylistAppointmentStatus(id, actorId, status);
    }
    adminDashboard() {
        return this.administration.adminDashboard();
    }
    adminUsers(query) {
        return this.administration.adminUsers(query);
    }
    adminDeleteUser(actorId, id) {
        return this.administration.adminDeleteUser(actorId, id);
    }
    adminSetUserStatus(actorId, id, active) {
        return this.administration.adminSetUserStatus(actorId, id, active);
    }
    employeeContext(actorId) {
        return this.access.employeeProfile(actorId);
    }
    clientLinkCandidates(routeId, actorId, phone) {
        return this.history.candidates(routeId, actorId, phone);
    }
    linkClientHistory(routeId, actorId, clientId, phone) {
        return this.history.link(routeId, actorId, clientId, phone);
    }
    clientNotifications(clientId, query) {
        return this.notifications.list(clientId, query);
    }
    readClientNotification(clientId, id) {
        return this.notifications.markRead(clientId, id);
    }
};
exports.CommerceService = CommerceService;
exports.CommerceService = CommerceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_history_service_1.ClientHistoryService,
        notifications_service_1.NotificationsService,
        commerce_access_service_1.CommerceAccessService,
        orders_service_1.OrdersService,
        measurements_service_1.MeasurementsService,
        team_service_1.TeamService,
        catalog_service_1.CatalogService,
        profiles_service_1.ProfilesService,
        appointments_service_1.AppointmentsService,
        administration_service_1.AdministrationService])
], CommerceService);
//# sourceMappingURL=commerce.service.js.map