"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
const configure_application_1 = require("./configure-application");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        bodyParser: false,
    });
    const config = app.get(config_1.ConfigService);
    app.useLogger(app.get(nestjs_pino_1.Logger));
    (0, configure_application_1.configureApplication)(app);
    if (config.get('NODE_ENV') !== 'production' ||
        config.get('SWAGGER_ENABLED') === 'true') {
        const document = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
            .setTitle('SurMesure API')
            .setDescription('API SurMesure')
            .setVersion('1.0')
            .addBearerAuth()
            .build());
        swagger_1.SwaggerModule.setup('docs', app, document);
    }
    await app.listen(config.get('PORT', 3000), '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map