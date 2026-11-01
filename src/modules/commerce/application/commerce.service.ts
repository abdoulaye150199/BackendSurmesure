import { Injectable } from '@nestjs/common';
import type { AppointmentStatus } from '@prisma/client';
import { PageQueryDto } from '../../../shared/application/page.dto';
import {
  CreateAppointmentDto,
  CreateCatalogItemDto,
  CreateClientModelMeasurementDto,
  CreateEmployeeAccountDto,
  CreateEmployeeMeasurementDto,
  CreateMeasurementDto,
  CreateOrderDto,
  CreatePersonnelDto,
  OrdersQueryDto,
  SaveClientMeasurementDto,
  UpdateCatalogItemDto,
  UpdateMeasurementDto,
  UpdateOrderDto,
  UpdatePersonnelDto,
  UpdateStylistProfileDto,
  ValidateMeasurementDto,
} from './commerce.dto';
import { ClientHistoryService } from './services/client-history.service';
import { CommerceAccessService } from './services/commerce-access.service';
import { NotificationsService } from './services/notifications.service';

import { AdministrationService } from './services/administration.service';
import { AppointmentsService } from './services/appointments.service';
import { CatalogService } from './services/catalog.service';
import { MeasurementsService } from './services/measurements.service';
import { OrdersService } from './services/orders.service';
import { ProfilesService } from './services/profiles.service';
import { TeamService } from './services/team.service';

@Injectable()
export class CommerceService {
  constructor(
    private readonly history: ClientHistoryService,
    private readonly notifications: NotificationsService,
    private readonly access: CommerceAccessService,
    private readonly orders: OrdersService,
    private readonly measurements: MeasurementsService,
    private readonly team: TeamService,
    private readonly catalog: CatalogService,
    private readonly profiles: ProfilesService,
    private readonly appointments: AppointmentsService,
    private readonly administration: AdministrationService,
  ) {}
  listOrders(routeId: string, actorId: string, query: OrdersQueryDto) {
    return this.orders.listOrders(routeId, actorId, query);
  }

  createOrder(routeId: string, actorId: string, dto: CreateOrderDto) {
    return this.orders.createOrder(routeId, actorId, dto);
  }

  createEmployeeOrder(actorId: string, dto: CreateOrderDto) {
    return this.orders.createEmployeeOrder(actorId, dto);
  }

  listEmployeeOrders(actorId: string, query: OrdersQueryDto) {
    return this.orders.listEmployeeOrders(actorId, query);
  }

  updateOrder(id: string, actorId: string, dto: UpdateOrderDto) {
    return this.orders.updateOrder(id, actorId, dto);
  }

  deleteOrder(id: string, actorId: string) {
    return this.orders.deleteOrder(id, actorId);
  }

  notifyOrder(id: string, actorId: string, message: string) {
    return this.orders.notifyOrder(id, actorId, message);
  }

  clientOrders(clientId: string, query: OrdersQueryDto) {
    return this.orders.clientOrders(clientId, query);
  }

  adminUpdateOrder(id: string, dto: UpdateOrderDto) {
    return this.orders.adminUpdateOrder(id, dto);
  }

  listMeasurements(
    routeId: string,
    actorId: string,
    limit: number,
    cursor?: string,
    query?: string,
  ) {
    return this.measurements.listMeasurements(routeId, actorId, limit, cursor, query);
  }

  createMeasurement(routeId: string, actorId: string, dto: CreateMeasurementDto) {
    return this.measurements.createMeasurement(routeId, actorId, dto);
  }

  updateMeasurement(id: string, actorId: string, dto: UpdateMeasurementDto) {
    return this.measurements.updateMeasurement(id, actorId, dto);
  }

  validateMeasurement(id: string, actorId: string, dto: ValidateMeasurementDto) {
    return this.measurements.validateMeasurement(id, actorId, dto);
  }

  deleteMeasurement(id: string, actorId: string) {
    return this.measurements.deleteMeasurement(id, actorId);
  }

  listEmployeeMeasurements(actorId: string, limit: number, cursor?: string) {
    return this.measurements.listEmployeeMeasurements(actorId, limit, cursor);
  }

  createEmployeeMeasurement(actorId: string, dto: CreateEmployeeMeasurementDto) {
    return this.measurements.createEmployeeMeasurement(actorId, dto);
  }

  updateEmployeeMeasurement(actorId: string, id: string, dto: UpdateMeasurementDto) {
    return this.measurements.updateEmployeeMeasurement(actorId, id, dto);
  }

  clientMeasurements(clientId: string) {
    return this.measurements.clientMeasurements(clientId);
  }

  saveClientMeasurements(clientId: string, dto: SaveClientMeasurementDto) {
    return this.measurements.saveClientMeasurements(clientId, dto);
  }

  createClientModelMeasurements(clientId: string, dto: CreateClientModelMeasurementDto) {
    return this.measurements.createClientModelMeasurements(clientId, dto);
  }

  listPersonnel(routeId: string, actorId: string) {
    return this.team.listPersonnel(routeId, actorId);
  }

  createEmployeeAccount(routeId: string, actorId: string, dto: CreateEmployeeAccountDto) {
    return this.team.createEmployeeAccount(routeId, actorId, dto);
  }

  setEmployeeAccess(routeId: string, personnelId: string, actorId: string, active: boolean) {
    return this.team.setEmployeeAccess(routeId, personnelId, actorId, active);
  }

  removeEmployee(routeId: string, personnelId: string, actorId: string) {
    return this.team.removeEmployee(routeId, personnelId, actorId);
  }

  createPersonnel(routeId: string, actorId: string, dto: CreatePersonnelDto) {
    return this.team.createPersonnel(routeId, actorId, dto);
  }

  updatePersonnel(routeId: string, id: string, actorId: string, dto: UpdatePersonnelDto) {
    return this.team.updatePersonnel(routeId, id, actorId, dto);
  }

  deletePersonnel(id: string, actorId: string) {
    return this.team.deletePersonnel(id, actorId);
  }

  createEmployeeCatalog(actorId: string, dto: CreateCatalogItemDto) {
    return this.catalog.createEmployeeCatalog(actorId, dto);
  }

  listCatalog(limit: number, cursor?: string) {
    return this.catalog.listCatalog(limit, cursor);
  }

  setCatalogLike(id: string, visitorId: string, liked: boolean) {
    return this.catalog.setCatalogLike(id, visitorId, liked);
  }

  getCatalog(id: string) {
    return this.catalog.getCatalog(id);
  }

  createCatalog(actorId: string, dto: CreateCatalogItemDto) {
    return this.catalog.createCatalog(actorId, dto);
  }

  updateCatalog(id: string, actorId: string, dto: UpdateCatalogItemDto) {
    return this.catalog.updateCatalog(id, actorId, dto);
  }

  deactivateCatalog(id: string, actorId: string) {
    return this.catalog.deactivateCatalog(id, actorId);
  }

  updateStylistProfile(actorId: string, dto: UpdateStylistProfileDto) {
    return this.profiles.updateStylistProfile(actorId, dto);
  }

  listStylists(limit: number, cursor?: string) {
    return this.profiles.listStylists(limit, cursor);
  }

  createAppointment(clientId: string, dto: CreateAppointmentDto) {
    return this.appointments.createAppointment(clientId, dto);
  }

  clientAppointments(clientId: string) {
    return this.appointments.clientAppointments(clientId);
  }

  stylistAppointments(routeId: string, actorId: string) {
    return this.appointments.stylistAppointments(routeId, actorId);
  }

  updateStylistAppointmentStatus(id: string, actorId: string, status: AppointmentStatus) {
    return this.appointments.updateStylistAppointmentStatus(id, actorId, status);
  }

  adminDashboard() {
    return this.administration.adminDashboard();
  }

  adminSetUserStatus(actorId: string, id: string, active: boolean) {
    return this.administration.adminSetUserStatus(actorId, id, active);
  }
  employeeContext(actorId: string) {
    return this.access.employeeProfile(actorId);
  }
  clientLinkCandidates(routeId: string, actorId: string, phone: string) {
    return this.history.candidates(routeId, actorId, phone);
  }
  linkClientHistory(routeId: string, actorId: string, clientId: string, phone: string) {
    return this.history.link(routeId, actorId, clientId, phone);
  }
  clientNotifications(clientId: string, query: PageQueryDto) {
    return this.notifications.list(clientId, query);
  }
  readClientNotification(clientId: string, id: string) {
    return this.notifications.markRead(clientId, id);
  }
}
