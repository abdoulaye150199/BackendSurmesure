import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageQueryDto } from '../../../shared/application/page.dto';
import { AuthUser, CurrentUser } from '../../identity/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../identity/presentation/jwt-auth.guard';
import { AccountRole } from '../../identity/domain/account-role';
import { Roles } from '../../identity/presentation/roles.decorator';
import { RolesGuard } from '../../identity/presentation/roles.guard';
import { CommerceService } from '../application/commerce.service';
import { AdminUserStatusDto, CreateAppointmentDto, CreateCatalogItemDto, CreateMeasurementDto, CreateOrderDto, CreatePersonnelDto, MeasurementsQueryDto, NotifyDto, OrdersQueryDto, SaveClientMeasurementDto, UpdateMeasurementDto, UpdateOrderDto, UpdatePersonnelDto } from '../application/commerce.dto';

@ApiTags('stylist workspace') @ApiBearerAuth() @Roles(AccountRole.STYLIST) @UseGuards(JwtAuthGuard, RolesGuard) @Controller()
export class StylistWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('stylist/:stylistId/orders') orders(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Query() q: OrdersQueryDto) { return this.service.listOrders(id, u.sub, q); }
  @Post('stylist/:stylistId/orders') addOrder(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Body() dto: CreateOrderDto) { return this.service.createOrder(id, u.sub, dto); }
  @Put('orders/:id') putOrder(@Param('id') id: string, @CurrentUser() u: AuthUser, @Body() dto: UpdateOrderDto) { return this.service.updateOrder(id, u.sub, dto); }
  @Patch('orders/:id') patchOrder(@Param('id') id: string, @CurrentUser() u: AuthUser, @Body() dto: UpdateOrderDto) { return this.service.updateOrder(id, u.sub, dto); }
  @Post('orders/:id/notify') notify(@Param('id') id: string, @CurrentUser() u: AuthUser, @Body() dto: NotifyDto) { return this.service.notifyOrder(id, u.sub, dto.message); }
  @Delete('orders/:id') deleteOrder(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.service.deleteOrder(id, u.sub); }
  @Get('stylist/:stylistId/measurements') measurements(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Query() q: PageQueryDto) { return this.service.listMeasurements(id, u.sub, q.limit, q.cursor); }
  @Get('stylist/:stylistId/appointments') appointments(@Param('stylistId') id: string, @CurrentUser() u: AuthUser) { return this.service.stylistAppointments(id, u.sub); }
  @Get('stylist/:stylistId/measurements/search') searchMeasurements(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Query() q: MeasurementsQueryDto) { return this.service.listMeasurements(id, u.sub, q.limit, q.cursor, q.q); }
  @Post('stylist/:stylistId/measurements') addMeasurement(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Body() dto: CreateMeasurementDto) { return this.service.createMeasurement(id, u.sub, dto); }
  @Put('measurements/:id') updateMeasurement(@Param('id') id: string, @CurrentUser() u: AuthUser, @Body() dto: UpdateMeasurementDto) { return this.service.updateMeasurement(id, u.sub, dto); }
  @Delete('measurements/:id') deleteMeasurement(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.service.deleteMeasurement(id, u.sub); }
  @Get('stylist/:stylistId/personnel') personnel(@Param('stylistId') id: string, @CurrentUser() u: AuthUser) { return this.service.listPersonnel(id, u.sub); }
  @Post('stylist/:stylistId/personnel') addPersonnel(@Param('stylistId') id: string, @CurrentUser() u: AuthUser, @Body() dto: CreatePersonnelDto) { return this.service.createPersonnel(id, u.sub, dto); }
  @Put('stylist/:stylistId/personnel/:id') updatePersonnel(@Param('stylistId') s: string, @Param('id') id: string, @CurrentUser() u: AuthUser, @Body() dto: UpdatePersonnelDto) { return this.service.updatePersonnel(s, id, u.sub, dto); }
  @Delete('personnel/:id') deletePersonnel(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.service.deletePersonnel(id, u.sub); }
  @Post('catalog') addCatalog(@CurrentUser() u: AuthUser, @Body() dto: CreateCatalogItemDto) { return this.service.createCatalog(u.sub, dto); }
}

@ApiTags('public') @Controller()
export class PublicController {
  constructor(private readonly service: CommerceService) {}
  @Get('catalog') catalog(@Query() q: PageQueryDto) { return this.service.listCatalog(q.limit, q.cursor); }
  @Get('catalog/:id') catalogItem(@Param('id') id: string) { return this.service.getCatalog(id); }
  @Get('stylists') stylists(@Query() q: PageQueryDto) { return this.service.listStylists(q.limit, q.cursor); }
  @Get('home') async home() { const [catalog, stylists] = await Promise.all([this.service.listCatalog(6), this.service.listStylists(6)]); return { heroTitle: 'Mode sur mesure', highlightedCategories: ['Robes', 'Costumes', 'Mariage'], catalog, stylists }; }
}

@ApiTags('client workspace') @ApiBearerAuth() @Roles(AccountRole.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard) @Controller()
export class ClientWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('orders') orders(@CurrentUser() user: AuthUser, @Query() query: OrdersQueryDto) {
    return this.service.clientOrders(user.sub, query);
  }
  @Get('measurements') measurements(@CurrentUser() user: AuthUser) {
    return this.service.clientMeasurements(user.sub);
  }
  @Put('client/measurements') saveMeasurements(@CurrentUser() user: AuthUser, @Body() dto: SaveClientMeasurementDto) {
    return this.service.saveClientMeasurements(user.sub, dto);
  }
  @Get('appointments') appointments(@CurrentUser() user: AuthUser) {
    return this.service.clientAppointments(user.sub);
  }
  @Post('appointments') appointment(@CurrentUser() user: AuthUser, @Body() dto: CreateAppointmentDto) {
    return this.service.createAppointment(user.sub, dto);
  }
}

@ApiTags('super admin') @ApiBearerAuth() @Roles(AccountRole.ADMIN) @UseGuards(JwtAuthGuard, RolesGuard) @Controller('admin')
export class AdminWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('dashboard') dashboard() { return this.service.adminDashboard(); }
  @Patch('users/:id/status') userStatus(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: AdminUserStatusDto) {
    return this.service.adminSetUserStatus(user.sub, id, dto.active);
  }
  @Patch('orders/:id') orderStatus(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.adminUpdateOrder(id, dto);
  }
}
