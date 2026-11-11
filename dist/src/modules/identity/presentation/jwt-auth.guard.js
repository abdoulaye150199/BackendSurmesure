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
exports.JwtAuthGuard = void 0;
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const user_repository_1 = require("../domain/user.repository");
let JwtAuthGuard = class JwtAuthGuard {
    jwt;
    config;
    users;
    constructor(jwt, config, users) {
        this.jwt = jwt;
        this.config = config;
        this.users = users;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Token manquant');
        }
        let claims;
        try {
            claims = await this.jwt.verifyAsync(token, {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Token invalide ou expiré');
        }
        if (typeof claims.sub !== 'string' || !(0, class_validator_1.isUUID)(claims.sub)) {
            throw new common_1.UnauthorizedException('Identité invalide');
        }
        const user = await this.users.findAccessById(claims.sub);
        if (!user?.active ||
            user.role !== claims.role ||
            user.sessionVersion !== (claims.sessionVersion ?? 0)) {
            throw new common_1.UnauthorizedException('Session révoquée ou compte désactivé');
        }
        request.user = { sub: user.id, role: user.role, email: user.email };
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService, Object])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map