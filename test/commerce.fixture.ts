import type { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';
import { AdministrationService } from '../src/modules/commerce/application/services/administration.service';
import { AppointmentsService } from '../src/modules/commerce/application/services/appointments.service';
import { CatalogService } from '../src/modules/commerce/application/services/catalog.service';
import { ClientHistoryService } from '../src/modules/commerce/application/services/client-history.service';
import { CommerceAccessService } from '../src/modules/commerce/application/services/commerce-access.service';
import { MeasurementsService } from '../src/modules/commerce/application/services/measurements.service';
import { NotificationsService } from '../src/modules/commerce/application/services/notifications.service';
import { OrdersService } from '../src/modules/commerce/application/services/orders.service';
import { ProfilesService } from '../src/modules/commerce/application/services/profiles.service';
import { TeamService } from '../src/modules/commerce/application/services/team.service';
export function createCommerceService(db: PrismaService): CommerceService {
  const access = new CommerceAccessService(db);
  return new CommerceService(
    new ClientHistoryService(db, access),
    new NotificationsService(db),
    access,
    new OrdersService(db, access),
    new MeasurementsService(db, access),
    new TeamService(db, access),
    new CatalogService(db, access),
    new ProfilesService(db),
    new AppointmentsService(db, access),
    new AdministrationService(db),
  );
}
