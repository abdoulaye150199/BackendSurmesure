"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ApiExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ApiExceptionFilter = ApiExceptionFilter_1 = class ApiExceptionFilter {
    logger = new common_1.Logger(ApiExceptionFilter_1.name);
    catch(error, host) {
        const response = host.switchToHttp().getResponse();
        if (error instanceof common_1.HttpException) {
            const body = error.getResponse();
            response
                .status(error.getStatus())
                .json(typeof body === 'string' ? { statusCode: error.getStatus(), message: body } : body);
            return;
        }
        const failure = this.persistenceFailure(error);
        if (failure.status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error({
                message: 'Erreur interne',
                type: error instanceof Error ? error.name : 'UnknownError',
            });
        }
        response.status(failure.status).json({ statusCode: failure.status, message: failure.message });
    }
    persistenceFailure(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return { status: 409, message: 'Une ressource utilise déjà ces informations.' };
                case 'P2003':
                    return {
                        status: 409,
                        message: 'Cette opération est incompatible avec les ressources associées.',
                    };
                case 'P2025':
                    return { status: 404, message: 'Ressource introuvable.' };
                case 'P2034':
                    return { status: 409, message: 'Une modification concurrente a eu lieu. Réessayez.' };
            }
        }
        if (error instanceof client_1.Prisma.PrismaClientValidationError) {
            return { status: 400, message: 'Paramètres invalides.' };
        }
        return { status: 500, message: 'Erreur interne. Réessayez ultérieurement.' };
    }
};
exports.ApiExceptionFilter = ApiExceptionFilter;
exports.ApiExceptionFilter = ApiExceptionFilter = ApiExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], ApiExceptionFilter);
//# sourceMappingURL=api-exception.filter.js.map