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
exports.EmployeeAccessDto = exports.UpdatePersonnelDto = exports.CreatePersonnelDto = exports.CreateEmployeeAccountDto = void 0;
const class_validator_1 = require("class-validator");
const fields_1 = require("../../../../shared/validation/fields");
class CreateEmployeeAccountDto {
    firstName;
    lastName;
    email;
    phone;
    password;
    specialization;
}
exports.CreateEmployeeAccountDto = CreateEmployeeAccountDto;
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "firstName", void 0);
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "lastName", void 0);
__decorate([
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "password", void 0);
__decorate([
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], CreateEmployeeAccountDto.prototype, "specialization", void 0);
class CreatePersonnelDto {
    firstName;
    lastName;
    email;
    phone;
    specialization;
}
exports.CreatePersonnelDto = CreatePersonnelDto;
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "firstName", void 0);
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "lastName", void 0);
__decorate([
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "phone", void 0);
__decorate([
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], CreatePersonnelDto.prototype, "specialization", void 0);
class UpdatePersonnelDto {
    firstName;
    lastName;
    email;
    phone;
    specialization;
    active;
}
exports.UpdatePersonnelDto = UpdatePersonnelDto;
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "firstName", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "lastName", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "email", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "phone", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], UpdatePersonnelDto.prototype, "specialization", void 0);
__decorate([
    (0, fields_1.OptionalField)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePersonnelDto.prototype, "active", void 0);
class EmployeeAccessDto {
    active;
}
exports.EmployeeAccessDto = EmployeeAccessDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmployeeAccessDto.prototype, "active", void 0);
//# sourceMappingURL=team.dto.js.map