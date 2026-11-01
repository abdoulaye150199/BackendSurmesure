import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { AccountRole } from '../../../identity/domain/account-role';
import type { AuthUser } from '../../../identity/presentation/current-user.decorator';
import { CurrentUser } from '../../../identity/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/presentation/jwt-auth.guard';
import { Roles } from '../../../identity/presentation/roles.decorator';
import { RolesGuard } from '../../../identity/presentation/roles.guard';
import {
  ClientLinkQueryDto,
  CreateCatalogItemDto,
  CreateEmployeeAccountDto,
  CreateMeasurementDto,
  CreateOrderDto,
  CreatePersonnelDto,
  EmployeeAccessDto,
  LinkClientHistoryDto,
  MeasurementsQueryDto,
  NotifyDto,
  OrdersQueryDto,
  UpdateAppointmentStatusDto,
  UpdateCatalogItemDto,
  UpdateMeasurementDto,
  UpdateOrderDto,
  UpdatePersonnelDto,
  UpdateStylistProfileDto,
  ValidateMeasurementDto,
} from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';

@ApiTags('stylist workspace')
@ApiBearerAuth()
@Roles(AccountRole.STYLIST)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class StylistWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('stylist/:stylistId/orders') orders(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Query() query: OrdersQueryDto,
  ) {
    return this.service.listOrders(id, user.sub, query);
  }
  @Get('stylist/:stylistId/clients/link-candidates') linkCandidates(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Query() query: ClientLinkQueryDto,
  ) {
    return this.service.clientLinkCandidates(id, user.sub, query.phone);
  }
  @Post('stylist/:stylistId/clients/link') linkHistory(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: LinkClientHistoryDto,
  ) {
    return this.service.linkClientHistory(id, user.sub, dto.clientId, dto.phone);
  }
  @Post('stylist/:stylistId/orders') addOrder(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.service.createOrder(id, user.sub, dto);
  }
  @Put('orders/:id') putOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.service.updateOrder(id, user.sub, dto);
  }
  @Patch('orders/:id') patchOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.service.updateOrder(id, user.sub, dto);
  }
  @Post('orders/:id/notify') notify(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: NotifyDto,
  ) {
    return this.service.notifyOrder(id, user.sub, dto.message);
  }
  @Delete('orders/:id') deleteOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.deleteOrder(id, user.sub);
  }
  @Patch('measurements/:id/validate') validateMeasurement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ValidateMeasurementDto,
  ) {
    return this.service.validateMeasurement(id, user.sub, dto);
  }
  @Get('stylist/:stylistId/measurements') measurements(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Query() query: PageQueryDto,
  ) {
    return this.service.listMeasurements(id, user.sub, query.limit, query.cursor);
  }
  @Get('stylist/:stylistId/appointments') appointments(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.stylistAppointments(id, user.sub);
  }
  @Patch('appointments/:id/status') updateAppointmentStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.service.updateStylistAppointmentStatus(id, user.sub, dto.status);
  }
  @Get('stylist/:stylistId/measurements/search') searchMeasurements(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Query() query: MeasurementsQueryDto,
  ) {
    return this.service.listMeasurements(id, user.sub, query.limit, query.cursor, query.q);
  }
  @Post('stylist/:stylistId/measurements') addMeasurement(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMeasurementDto,
  ) {
    return this.service.createMeasurement(id, user.sub, dto);
  }
  @Put('measurements/:id') updateMeasurement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeasurementDto,
  ) {
    return this.service.updateMeasurement(id, user.sub, dto);
  }
  @Delete('measurements/:id') deleteMeasurement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.deleteMeasurement(id, user.sub);
  }
  @Get('stylist/:stylistId/personnel') personnel(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.listPersonnel(id, user.sub);
  }
  @Post('stylist/:stylistId/personnel/accounts') createEmployeeAccount(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEmployeeAccountDto,
  ) {
    return this.service.createEmployeeAccount(id, user.sub, dto);
  }
  @Patch('stylist/:stylistId/personnel/:id/access') setEmployeeAccess(
    @Param('stylistId', new ParseUUIDPipe()) stylist: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: EmployeeAccessDto,
  ) {
    return this.service.setEmployeeAccess(stylist, id, user.sub, dto.active);
  }
  @Delete('stylist/:stylistId/personnel/:id') removeEmployee(
    @Param('stylistId', new ParseUUIDPipe()) stylist: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.removeEmployee(stylist, id, user.sub);
  }
  @Post('stylist/:stylistId/personnel') addPersonnel(
    @Param('stylistId', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePersonnelDto,
  ) {
    return this.service.createPersonnel(id, user.sub, dto);
  }
  @Put('stylist/:stylistId/personnel/:id') updatePersonnel(
    @Param('stylistId', new ParseUUIDPipe()) stylist: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePersonnelDto,
  ) {
    return this.service.updatePersonnel(stylist, id, user.sub, dto);
  }
  @Delete('personnel/:id') deletePersonnel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.deletePersonnel(id, user.sub);
  }
  @Post('catalog') addCatalog(@CurrentUser() user: AuthUser, @Body() dto: CreateCatalogItemDto) {
    return this.service.createCatalog(user.sub, dto);
  }
  @Patch('catalog/:id') updateCatalog(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.service.updateCatalog(id, user.sub, dto);
  }
  @Delete('catalog/:id') deleteCatalog(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.deactivateCatalog(id, user.sub);
  }
  @Put('stylist/profile') updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateStylistProfileDto,
  ) {
    return this.service.updateStylistProfile(user.sub, dto);
  }
}
