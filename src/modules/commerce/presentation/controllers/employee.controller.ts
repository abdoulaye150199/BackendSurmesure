import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
  CreateCatalogItemDto,
  CreateEmployeeMeasurementDto,
  CreateOrderDto,
  OrdersQueryDto,
  UpdateMeasurementDto,
} from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';

@ApiTags('employee workspace')
@ApiBearerAuth()
@Roles(AccountRole.EMPLOYEE)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employee')
export class EmployeeWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('orders') orders(@CurrentUser() user: AuthUser, @Query() query: OrdersQueryDto) {
    return this.service.listEmployeeOrders(user.sub, query);
  }
  @Post('orders') createOrder(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.service.createEmployeeOrder(user.sub, dto);
  }
  @Post('catalog') createCatalog(@CurrentUser() user: AuthUser, @Body() dto: CreateCatalogItemDto) {
    return this.service.createEmployeeCatalog(user.sub, dto);
  }
  @Get('me') context(@CurrentUser() user: AuthUser) {
    return this.service.employeeContext(user.sub);
  }
  @Get('measurements') measurements(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.service.listEmployeeMeasurements(user.sub, query.limit, query.cursor);
  }
  @Post('measurements') createMeasurement(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEmployeeMeasurementDto,
  ) {
    return this.service.createEmployeeMeasurement(user.sub, dto);
  }
  @Put('measurements/:id') updateMeasurement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeasurementDto,
  ) {
    return this.service.updateEmployeeMeasurement(user.sub, id, dto);
  }
}
