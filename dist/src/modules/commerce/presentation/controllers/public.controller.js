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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const page_dto_1 = require("../../../../shared/application/page.dto");
const commerce_dto_1 = require("../../application/commerce.dto");
const commerce_service_1 = require("../../application/commerce.service");
let PublicController = class PublicController {
    service;
    constructor(service) {
        this.service = service;
    }
    catalog(query) {
        return this.service.listCatalog(query.limit, query.cursor);
    }
    likeCatalog(id, dto) {
        return this.service.setCatalogLike(id, dto.visitorId, dto.liked);
    }
    catalogItem(id) {
        return this.service.getCatalog(id);
    }
    stylists(query) {
        return this.service.listStylists(query.limit, query.cursor);
    }
    async home() {
        const [catalog, stylists] = await Promise.all([
            this.service.listCatalog(6),
            this.service.listStylists(6),
        ]);
        return {
            heroTitle: 'Mode sur mesure',
            highlightedCategories: ['Robes', 'Costumes', 'Mariage'],
            catalog,
            stylists,
        };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_dto_1.PageQueryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "catalog", null);
__decorate([
    (0, common_1.Post)('catalog/:id/like'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commerce_dto_1.CatalogLikeDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "likeCatalog", null);
__decorate([
    (0, common_1.Get)('catalog/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "catalogItem", null);
__decorate([
    (0, common_1.Get)('stylists'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_dto_1.PageQueryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "stylists", null);
__decorate([
    (0, common_1.Get)('home'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "home", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [commerce_service_1.CommerceService])
], PublicController);
//# sourceMappingURL=public.controller.js.map