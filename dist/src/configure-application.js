"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApplication = configureApplication;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const api_exception_filter_1 = require("./shared/presentation/api-exception.filter");
function configureApplication(app) {
    const config = app.get(config_1.ConfigService);
    app.set('trust proxy', config.get('TRUST_PROXY_HOPS', 0));
    app.use((0, helmet_1.default)());
    app.useBodyParser('json', { limit: '256kb' });
    const allowedOrigins = new Set(config
        .getOrThrow('CORS_ORIGINS')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean));
    allowedOrigins.add('https://surmesure.liggeypro.com');
    app.enableCors({
        origin(origin, callback) {
            const local = config.get('NODE_ENV') === 'development' &&
                !!origin &&
                /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            if (origin === undefined || allowedOrigins.has(origin) || local) {
                callback(null, true);
            }
            else {
                callback(new common_1.ForbiddenException('Origine CORS non autorisée'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Request-Id'],
    });
    app.enableShutdownHooks();
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new api_exception_filter_1.ApiExceptionFilter());
}
//# sourceMappingURL=configure-application.js.map