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
exports.CreateClientModelMeasurementDto = exports.SaveClientMeasurementDto = exports.ValidateMeasurementDto = exports.UpdateMeasurementDto = exports.CreateEmployeeMeasurementDto = exports.CreateMeasurementDto = exports.MeasurementsQueryDto = void 0;
const class_validator_1 = require("class-validator");
const page_dto_1 = require("../../../../shared/application/page.dto");
const fields_1 = require("../../../../shared/validation/fields");
class MeasurementsQueryDto extends page_dto_1.PageQueryDto {
    q;
}
exports.MeasurementsQueryDto = MeasurementsQueryDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(1, 160),
    __metadata("design:type", String)
], MeasurementsQueryDto.prototype, "q", void 0);
class CreateMeasurementDto {
    clientId;
    clientName;
    clientPhone;
    measurements;
    notes = '';
}
exports.CreateMeasurementDto = CreateMeasurementDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMeasurementDto.prototype, "clientId", void 0);
__decorate([
    (0, fields_1.TextField)(2),
    __metadata("design:type", String)
], CreateMeasurementDto.prototype, "clientName", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateMeasurementDto.prototype, "clientPhone", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMeasurementDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", Object)
], CreateMeasurementDto.prototype, "notes", void 0);
class CreateEmployeeMeasurementDto {
    clientName;
    clientPhone;
    measurements;
    notes = '';
}
exports.CreateEmployeeMeasurementDto = CreateEmployeeMeasurementDto;
__decorate([
    (0, fields_1.TextField)(2),
    __metadata("design:type", String)
], CreateEmployeeMeasurementDto.prototype, "clientName", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateEmployeeMeasurementDto.prototype, "clientPhone", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEmployeeMeasurementDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", Object)
], CreateEmployeeMeasurementDto.prototype, "notes", void 0);
class UpdateMeasurementDto {
    measurements;
    notes;
}
exports.UpdateMeasurementDto = UpdateMeasurementDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateMeasurementDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], UpdateMeasurementDto.prototype, "notes", void 0);
class ValidateMeasurementDto {
    modelName;
    expectedUpdatedAt;
}
exports.ValidateMeasurementDto = ValidateMeasurementDto;
__decorate([
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], ValidateMeasurementDto.prototype, "modelName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ValidateMeasurementDto.prototype, "expectedUpdatedAt", void 0);
class SaveClientMeasurementDto {
    measurementId;
    stylistId;
    measurements;
    notes;
}
exports.SaveClientMeasurementDto = SaveClientMeasurementDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveClientMeasurementDto.prototype, "measurementId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaveClientMeasurementDto.prototype, "stylistId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveClientMeasurementDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], SaveClientMeasurementDto.prototype, "notes", void 0);
class CreateClientModelMeasurementDto {
    modelType;
    stylistId;
    modelName;
    measurements;
    notes;
}
exports.CreateClientModelMeasurementDto = CreateClientModelMeasurementDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 120),
    __metadata("design:type", String)
], CreateClientModelMeasurementDto.prototype, "modelType", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClientModelMeasurementDto.prototype, "stylistId", void 0);
__decorate([
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], CreateClientModelMeasurementDto.prototype, "modelName", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateClientModelMeasurementDto.prototype, "measurements", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(0, 1000),
    __metadata("design:type", String)
], CreateClientModelMeasurementDto.prototype, "notes", void 0);
//# sourceMappingURL=measurements.dto.js.map