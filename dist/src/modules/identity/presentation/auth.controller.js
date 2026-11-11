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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_dto_1 = require("../application/auth.dto");
const auth_service_1 = require("../application/auth.service");
const google_auth_service_1 = require("../application/google-auth.service");
const account_role_1 = require("../domain/account-role");
const current_user_decorator_1 = require("./current-user.decorator");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const roles_decorator_1 = require("./roles.decorator");
const roles_guard_1 = require("./roles.guard");
let AuthController = class AuthController {
    auth;
    google;
    constructor(auth, google) {
        this.auth = auth;
        this.google = google;
    }
    googleConfig() {
        return this.google.configuration();
    }
    googleLogin(dto) {
        return this.google.login(dto.credential);
    }
    googleRegister(dto) {
        return this.google.register(dto);
    }
    register(dto) {
        return this.auth.register(dto);
    }
    login(dto) {
        return this.auth.login(dto);
    }
    clientLogin(dto) {
        return this.auth.login(dto, account_role_1.AccountRole.CLIENT);
    }
    stylistSignup(dto) {
        return this.auth.register(dto);
    }
    stylistLogin(dto) {
        return this.auth.login(dto, account_role_1.AccountRole.STYLIST);
    }
    employeeLogin(dto) {
        return this.auth.login(dto, account_role_1.AccountRole.EMPLOYEE);
    }
    adminLogin(dto) {
        return this.auth.login(dto, account_role_1.AccountRole.ADMIN);
    }
    changeEmployeePassword(user, dto) {
        return this.auth.changeEmployeePassword(user.sub, dto);
    }
    refresh(dto) {
        return this.auth.refresh(dto.refreshToken);
    }
    me(user) {
        return this.auth.me(user.sub);
    }
    stylistMe(user) {
        return this.auth.me(user.sub);
    }
    adminMe(user) {
        return this.auth.me(user.sub);
    }
    logout(user) {
        return this.auth.logout(user.sub);
    }
    stylistLogout(user) {
        return this.auth.logout(user.sub);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleConfig", null);
__decorate([
    (0, common_1.Post)('google/login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.GoogleLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Post)('google/register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.GoogleRegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleRegister", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('client/login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "clientLogin", null);
__decorate([
    (0, common_1.Post)('stylist/signup'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.StylistRegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "stylistSignup", null);
__decorate([
    (0, common_1.Post)('stylist/login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "stylistLogin", null);
__decorate([
    (0, common_1.Post)('employee/login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "employeeLogin", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('employee/password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.EMPLOYEE),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangeEmployeePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changeEmployeePassword", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('stylist/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.STYLIST),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "stylistMe", null);
__decorate([
    (0, common_1.Get)('admin/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(account_role_1.AccountRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "adminMe", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('stylist/logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "stylistLogout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        google_auth_service_1.GoogleAuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map