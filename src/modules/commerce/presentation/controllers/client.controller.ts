import {
  Body,
  Controller,
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
  CreateAppointmentDto,
  CreateClientModelMeasurementDto,
  OrdersQueryDto,
  SaveClientMeasurementDto,
} from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';

@ApiTags('client workspace')
@ApiBearerAuth()
@Roles(AccountRole.CLIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ClientWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('client/notifications') notifications(
    @CurrentUser() user: AuthUser,
    @Query() query: PageQueryDto,
  ) {
    return this.service.clientNotifications(user.sub, query);
  }
  @Patch('client/notifications/:id/read') readNotification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.readClientNotification(user.sub, id);
  }
  @Get('orders') orders(@CurrentUser() user: AuthUser, @Query() query: OrdersQueryDto) {
    return this.service.clientOrders(user.sub, query);
  }
  @Get('measurements') measurements(@CurrentUser() user: AuthUser) {
    return this.service.clientMeasurements(user.sub);
  }
  @Post('client/measurements') createModelMeasurements(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateClientModelMeasurementDto,
  ) {
    return this.service.createClientModelMeasurements(user.sub, dto);
  }
  @Put('client/measurements') saveMeasurements(
    @CurrentUser() user: AuthUser,
    @Body() dto: SaveClientMeasurementDto,
  ) {
    return this.service.saveClientMeasurements(user.sub, dto);
  }
  @Get('appointments') appointments(@CurrentUser() user: AuthUser) {
    return this.service.clientAppointments(user.sub);
  }
  @Post('appointments') appointment(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.service.createAppointment(user.sub, dto);
  }
}
