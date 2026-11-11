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
exports.NotifyDto = exports.UpdateOrderDto = exports.CreateOrderDto = exports.OrdersQueryDto = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const page_dto_1 = require("../../../../shared/application/page.dto");
const fields_1 = require("../../../../shared/validation/fields");
class OrdersQueryDto extends page_dto_1.PageQueryDto {
    status;
}
exports.OrdersQueryDto = OrdersQueryDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus),
    __metadata("design:type", String)
], OrdersQueryDto.prototype, "status", void 0);
class CreateOrderDto {
    measurements;
    durationDays;
    dueAt;
    clientId;
    clientName;
    clientPhone;
    description;
    totalPrice;
    notes;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateOrderDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3650),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "durationDays", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "dueAt", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clientId", void 0);
__decorate([
    (0, fields_1.TextField)(2),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clientName", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clientPhone", void 0);
__decorate([
    (0, fields_1.TextField)(2, 1000),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "description", void 0);
__decorate([
    (0, fields_1.NumericField)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9999999999.99),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalPrice", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "notes", void 0);
class UpdateOrderDto {
    description;
    status;
    totalPrice;
    notes;
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 1000),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "description", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.NumericField)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(9999999999.99),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "totalPrice", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "notes", void 0);
class NotifyDto {
    message;
}
exports.NotifyDto = NotifyDto;
__decorate([
    (0, fields_1.TextField)(2, 1000),
    __metadata("design:type", String)
], NotifyDto.prototype, "message", void 0);
//# sourceMappingURL=orders.dto.js.map