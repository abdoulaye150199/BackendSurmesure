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
exports.AdminUsersQueryDto = exports.AdminUserStatusDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const page_dto_1 = require("../../../../shared/application/page.dto");
const fields_1 = require("../../../../shared/validation/fields");
class AdminUserStatusDto {
    active;
}
exports.AdminUserStatusDto = AdminUserStatusDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUserStatusDto.prototype, "active", void 0);
class AdminUsersQueryDto extends page_dto_1.PageQueryDto {
    page;
    search;
    role;
}
exports.AdminUsersQueryDto = AdminUsersQueryDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000000),
    __metadata("design:type", Number)
], AdminUsersQueryDto.prototype, "page", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "search", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsIn)(['CLIENT', 'STYLIST', 'EMPLOYEE', 'ADMIN']),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "role", void 0);
//# sourceMappingURL=administration.dto.js.map