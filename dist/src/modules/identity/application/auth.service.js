"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const node_crypto_1 = require("node:crypto");
const contact_1 = require("../../../shared/domain/contact");
const account_role_1 = require("../domain/account-role");
const token_duration_1 = require("../domain/token-duration");
const user_repository_1 = require("../domain/user.repository");
let AuthService = class AuthService {
    users;
    jwt;
    config;
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        if (await this.users.findByEmail(dto.email)) {
            throw new common_1.ConflictException('Un compte utilise déjà cet email');
        }
        const role = 'businessName' in dto ? account_role_1.AccountRole.STYLIST : account_role_1.AccountRole.CLIENT;
        const { firstName, lastName, email, phone, password } = dto;
        const businessName = 'businessName' in dto ? dto.businessName : undefined;
        let user;
        try {
            user = await this.users.create({
                firstName,
                lastName,
                email: email.trim().toLowerCase(),
                phone: (0, contact_1.canonicalPhone)(phone),
                passwordHash: await argon2.hash(password),
                role,
                ...(businessName ? { businessName } : {}),
            });
        }
        catch (error) {
            if (error instanceof user_repository_1.AccountConflictError) {
                throw new common_1.ConflictException('Cet e-mail ou ce numéro de téléphone est déjà associé à un compte.');
            }
            throw error;
        }
        return this.issueTokens(user);
    }
    async login(dto, requiredRole) {
        const user = await this.users.findByEmail(dto.email);
        if (!user ||
            !user.active ||
            !!user.googleSubject ||
            (requiredRole && user.role !== requiredRole) ||
            !(await argon2.verify(user.passwordHash, dto.password))) {
            throw new common_1.UnauthorizedException('Identifiants invalides');
        }
        return this.issueTokens(user);
    }
    async refresh(token) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(token, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalide');
        }
        if (!(0, class_validator_1.isUUID)(payload.sub)) {
            throw new common_1.UnauthorizedException('Refresh token invalide');
        }
        const user = await this.users.findById(payload.sub);
        if (!user?.active ||
            !user.refreshTokenHash ||
            !(await argon2.verify(user.refreshTokenHash, token))) {
            throw new common_1.UnauthorizedException('Refresh token invalide');
        }
        return this.issueTokens(user, user.refreshTokenHash);
    }
    async changeEmployeePassword(userId, dto) {
        const user = await this.users.findById(userId);
        if (!user?.active ||
            user.role !== account_role_1.AccountRole.EMPLOYEE ||
            !(await argon2.verify(user.passwordHash, dto.currentPassword))) {
            throw new common_1.UnauthorizedException('Le mot de passe actuel est incorrect.');
        }
        if (dto.currentPassword === dto.newPassword) {
            throw new common_1.BadRequestException('Choisissez un nouveau mot de passe différent.');
        }
        const passwordHash = await argon2.hash(dto.newPassword);
        if (!(await this.users.changePassword(userId, user.passwordHash, passwordHash))) {
            throw new common_1.ConflictException('Le compte a été modifié. Reconnectez-vous avant de réessayer.');
        }
        return this.issueTokens({
            ...user,
            passwordHash,
            mustChangePassword: false,
            sessionVersion: (user.sessionVersion ?? 0) + 1,
        });
    }
    async logout(userId) {
        await this.users.revokeSessions(userId);
        return { success: true };
    }
    async me(userId) {
        const user = await this.users.findById(userId);
        if (!user?.active) {
            throw new common_1.UnauthorizedException();
        }
        return this.publicUser(user);
    }
    async issueTokens(user, previousRefreshHash) {
        const payload = {
            sub: user.id,
            role: user.role,
            email: user.email,
            sessionVersion: user.sessionVersion ?? 0,
        };
        const [token, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
                expiresIn: (0, token_duration_1.tokenDurationSeconds)(this.config.get('JWT_ACCESS_TTL', '15m')),
                jwtid: (0, node_crypto_1.randomUUID)(),
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: (0, token_duration_1.tokenDurationSeconds)(this.config.get('JWT_REFRESH_TTL', '30d')),
                jwtid: (0, node_crypto_1.randomUUID)(),
            }),
        ]);
        if (!(await this.users.saveRefreshToken(user.id, await argon2.hash(refreshToken), user.sessionVersion ?? 0, previousRefreshHash))) {
            throw new common_1.UnauthorizedException('Session révoquée ou déjà renouvelée. Reconnectez-vous.');
        }
        return { token, refreshToken, data: this.publicUser(user) };
    }
    publicUser(user) {
        return {
            id: user.id,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            isActive: user.active,
            mustChangePassword: user.mustChangePassword,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map