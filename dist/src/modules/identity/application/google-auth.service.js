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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../../infrastructure/prisma/prisma.service");
const contact_1 = require("../../../shared/domain/contact");
const auth_service_1 = require("./auth.service");
let GoogleAuthService = class GoogleAuthService {
    config;
    db;
    auth;
    google = new google_auth_library_1.OAuth2Client();
    constructor(config, db, auth) {
        this.config = config;
        this.db = db;
        this.auth = auth;
    }
    configuration() {
        return { clientId: this.config.get('GOOGLE_CLIENT_ID') || null };
    }
    async verify(credential) {
        const clientId = this.configuration().clientId;
        if (!clientId) {
            throw new common_1.ServiceUnavailableException('La connexion Google est momentanément indisponible.');
        }
        try {
            const ticket = await this.google.verifyIdToken({ idToken: credential, audience: clientId });
            const identity = ticket.getPayload();
            if (!identity?.sub || !identity.email || identity.email_verified !== true) {
                throw new Error('Invalid identity');
            }
            return identity;
        }
        catch {
            throw new common_1.UnauthorizedException('Identité Google invalide ou expirée. Réessayez.');
        }
    }
    async login(credential) {
        const identity = await this.verify(credential);
        const user = await this.db.user.findUnique({
            where: { googleSubject: identity.sub, deletedAt: null },
        });
        if (!user?.active || !['CLIENT', 'STYLIST'].includes(user.role)) {
            throw new common_1.UnauthorizedException('Aucun compte inscrit avec Google. Inscrivez-vous d’abord avec Google.');
        }
        return this.auth.issueTokens(user);
    }
    async register(dto) {
        const identity = await this.verify(dto.credential);
        try {
            const user = await this.db.user.create({
                data: {
                    googleSubject: identity.sub,
                    email: identity.email.trim().toLowerCase(),
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: (0, contact_1.canonicalPhone)(dto.phone),
                    passwordHash: await argon2.hash((0, node_crypto_1.randomBytes)(48).toString('base64url')),
                    role: dto.role === 'stylist' ? 'STYLIST' : 'CLIENT',
                    ...(dto.role === 'stylist'
                        ? { stylist: { create: { businessName: dto.businessName, specialties: [] } } }
                        : {}),
                },
            });
            return this.auth.issueTokens(user);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('Cet e-mail, ce numéro ou ce compte Google est déjà inscrit. Aucun compte existant n’a été rattaché.');
            }
            throw error;
        }
    }
};
exports.GoogleAuthService = GoogleAuthService;
exports.GoogleAuthService = GoogleAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], GoogleAuthService);
//# sourceMappingURL=google-auth.service.js.map