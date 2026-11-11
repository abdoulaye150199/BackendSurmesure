"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const environment_1 = require("./configuration/environment");
const request_id_1 = require("./configuration/request-id");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const commerce_module_1 = require("./modules/commerce/commerce.module");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/identity/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, cache: true, validate: (env) => environment_1.envSchema.parse(env) }),
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    pinoHttp: {
                        level: config.get('LOG_LEVEL', 'info'),
                        redact: [
                            'req.headers.authorization',
                            'req.body.password',
                            'req.body.currentPassword',
                            'req.body.newPassword',
                            'req.body.refreshToken',
                            'req.body.credential',
                            'res.headers["set-cookie"]',
                        ],
                        genReqId: (request) => (0, request_id_1.createRequestId)(request.headers['x-request-id']),
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            commerce_module_1.CommerceModule,
            health_module_1.HealthModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map