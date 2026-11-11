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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStylistProfileDto = exports.UpdateCatalogItemDto = exports.CreateCatalogItemDto = exports.CatalogLikeDto = void 0;
const class_validator_1 = require("class-validator");
const fields_1 = require("../../../../shared/validation/fields");
class CatalogLikeDto {
    visitorId;
    liked;
}
exports.CatalogLikeDto = CatalogLikeDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CatalogLikeDto.prototype, "visitorId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CatalogLikeDto.prototype, "liked", void 0);
class CreateCatalogItemDto {
    title;
    description = '';
    imageUrl;
    price;
    currency = 'XOF';
    availableColors;
}
exports.CreateCatalogItemDto = CreateCatalogItemDto;
__decorate([
    (0, fields_1.TextField)(2, 100),
    __metadata("design:type", String)
], CreateCatalogItemDto.prototype, "title", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", Object)
], CreateCatalogItemDto.prototype, "description", void 0);
__decorate([
    (0, fields_1.IsImageLocation)(),
    __metadata("design:type", String)
], CreateCatalogItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, fields_1.NumericField)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9999999999.99),
    __metadata("design:type", Number)
], CreateCatalogItemDto.prototype, "price", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsIn)(['XOF', 'EUR', 'USD']),
    __metadata("design:type", Object)
], CreateCatalogItemDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MinLength)(1, { each: true }),
    (0, class_validator_1.MaxLength)(40, { each: true }),
    __metadata("design:type", Array)
], CreateCatalogItemDto.prototype, "availableColors", void 0);
class UpdateCatalogItemDto {
    title;
    description;
    imageUrl;
    price;
    currency;
    availableColors;
}
exports.UpdateCatalogItemDto = UpdateCatalogItemDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 100),
    __metadata("design:type", String)
], UpdateCatalogItemDto.prototype, "title", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], UpdateCatalogItemDto.prototype, "description", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.IsImageLocation)(),
    __metadata("design:type", String)
], UpdateCatalogItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.NumericField)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9999999999.99),
    __metadata("design:type", Number)
], UpdateCatalogItemDto.prototype, "price", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsIn)(['XOF', 'EUR', 'USD']),
    __metadata("design:type", String)
], UpdateCatalogItemDto.prototype, "currency", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MinLength)(1, { each: true }),
    (0, class_validator_1.MaxLength)(40, { each: true }),
    __metadata("design:type", Array)
], UpdateCatalogItemDto.prototype, "availableColors", void 0);
class UpdateStylistProfileDto {
    businessName;
    about;
    specialties;
    profileImage;
}
exports.UpdateStylistProfileDto = UpdateStylistProfileDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], UpdateStylistProfileDto.prototype, "businessName", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], UpdateStylistProfileDto.prototype, "about", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MinLength)(1, { each: true }),
    (0, class_validator_1.MaxLength)(80, { each: true }),
    __metadata("design:type", Array)
], UpdateStylistProfileDto.prototype, "specialties", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.IsImageLocation)(true),
    __metadata("design:type", String)
], UpdateStylistProfileDto.prototype, "profileImage", void 0);
//# sourceMappingURL=catalog.dto.js.map