import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../application/auth.service';
import { LoginDto, RefreshDto, RegisterDto, StylistRegisterDto } from '../application/auth.dto';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AccountRole } from '../domain/account-role';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') @Throttle({ default: { limit: 5, ttl: 60_000 } }) register(@Body() dto: RegisterDto) { return this.auth.register({ ...dto, role: AccountRole.CLIENT }); }
  @Post('login') @Throttle({ default: { limit: 10, ttl: 60_000 } }) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('client/login') @Throttle({ default: { limit: 10, ttl: 60_000 } }) clientLogin(@Body() dto: LoginDto) { return this.auth.login(dto, AccountRole.CLIENT); }
  @Post('stylist/signup') @Throttle({ default: { limit: 5, ttl: 60_000 } }) stylistSignup(@Body() dto: StylistRegisterDto) { return this.auth.register(dto); }
  @Post('stylist/login') stylistLogin(@Body() dto: LoginDto) { return this.auth.login(dto, AccountRole.STYLIST); }
  @Post('admin/login') @Throttle({ default: { limit: 5, ttl: 60_000 } }) adminLogin(@Body() dto: LoginDto) { return this.auth.login(dto, AccountRole.ADMIN); }
  @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
  @Get('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) me(@CurrentUser() user: AuthUser) { return this.auth.me(user.sub); }
  @Get('stylist/me') @ApiBearerAuth() @Roles(AccountRole.STYLIST) @UseGuards(JwtAuthGuard, RolesGuard) stylistMe(@CurrentUser() user: AuthUser) { return this.auth.me(user.sub); }
  @Get('admin/me') @ApiBearerAuth() @Roles(AccountRole.ADMIN) @UseGuards(JwtAuthGuard, RolesGuard) adminMe(@CurrentUser() user: AuthUser) { return this.auth.me(user.sub); }
  @Post('logout') @ApiBearerAuth() @UseGuards(JwtAuthGuard) logout(@CurrentUser() user: AuthUser) { return this.auth.logout(user.sub); }
  @Post('stylist/logout') @ApiBearerAuth() @UseGuards(JwtAuthGuard) stylistLogout(@CurrentUser() user: AuthUser) { return this.auth.logout(user.sub); }
}
