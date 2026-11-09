import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountRole } from '../../../identity/domain/account-role';
import type { AuthUser } from '../../../identity/presentation/current-user.decorator';
import { CurrentUser } from '../../../identity/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/presentation/jwt-auth.guard';
import { Roles } from '../../../identity/presentation/roles.decorator';
import { RolesGuard } from '../../../identity/presentation/roles.guard';
import {
  AdminUsersQueryDto,
  AdminUserStatusDto,
  UpdateOrderDto,
} from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';

@ApiTags('super admin')
@ApiBearerAuth()
@Roles(AccountRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminWorkspaceController {
  constructor(private readonly service: CommerceService) {}
  @Get('dashboard') dashboard() {
    return this.service.adminDashboard();
  }
  @Get('users') users(@Query() query: AdminUsersQueryDto) {
    return this.service.adminUsers(query);
  }
  @Delete('users/:id') deleteUser(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.adminDeleteUser(user.sub, id);
  }
  @Patch('users/:id/status') userStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AdminUserStatusDto,
  ) {
    return this.service.adminSetUserStatus(user.sub, id, dto.active);
  }
  @Patch('orders/:id') orderStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.service.adminUpdateOrder(id, dto);
  }
}
