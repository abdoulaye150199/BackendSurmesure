import { Module } from '@nestjs/common';
import { AuthModule } from '../identity/auth.module';
import { CommerceService } from './application/commerce.service';
import { AdministrationService } from './application/services/administration.service';
import { AppointmentsService } from './application/services/appointments.service';
import { CatalogService } from './application/services/catalog.service';
import { ClientHistoryService } from './application/services/client-history.service';
import { CommerceAccessService } from './application/services/commerce-access.service';
import { MeasurementsService } from './application/services/measurements.service';
import { NotificationsService } from './application/services/notifications.service';
import { OrdersService } from './application/services/orders.service';
import { ProfilesService } from './application/services/profiles.service';
import { TeamService } from './application/services/team.service';
import {
  AdminWorkspaceController,
  ClientWorkspaceController,
  EmployeeWorkspaceController,
  PublicController,
  StylistWorkspaceController,
} from './presentation/commerce.controller';
@Module({
  imports: [AuthModule],
  providers: [
    ClientHistoryService,
    NotificationsService,
    CommerceService,
    CommerceAccessService,
    OrdersService,
    MeasurementsService,
    TeamService,
    CatalogService,
    ProfilesService,
    AppointmentsService,
    AdministrationService,
  ],
  controllers: [
    PublicController,
    ClientWorkspaceController,
    StylistWorkspaceController,
    EmployeeWorkspaceController,
    AdminWorkspaceController,
  ],
})
export class CommerceModule {}
