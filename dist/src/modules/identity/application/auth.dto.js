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
exports.ChangeEmployeePasswordDto = exports.GoogleRegisterDto = exports.GoogleLoginDto = exports.RefreshDto = exports.LoginDto = exports.StylistRegisterDto = exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const fields_1 = require("../../../shared/validation/fields");
class RegisterDto {
    firstName;
    lastName;
    email;
    phone;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fatou', minLength: 2 }),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ndiaye', minLength: 2 }),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fatou@example.com', format: 'email' }),
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+221 77 000 00 00',
        description: 'Numéro international avec indicatif pays.',
    }),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 10, format: 'password', writeOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class StylistRegisterDto {
    firstName;
    lastName;
    businessName;
    email;
    phone;
    password;
}
exports.StylistRegisterDto = StylistRegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Awa', minLength: 2 }),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diop', minLength: 2 }),
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Atelier Awa', minLength: 2 }),
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'awa@example.com', format: 'email' }),
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+221 77 000 00 00',
        description: 'Numéro international avec indicatif pays.',
    }),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 10, format: 'password', writeOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], StylistRegisterDto.prototype, "password", void 0);
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, fields_1.TextField)(3, 254),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RefreshDto {
    refreshToken;
}
exports.RefreshDto = RefreshDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4096),
    __metadata("design:type", String)
], RefreshDto.prototype, "refreshToken", void 0);
class GoogleLoginDto {
    credential;
}
exports.GoogleLoginDto = GoogleLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(8192),
    __metadata("design:type", String)
], GoogleLoginDto.prototype, "credential", void 0);
class GoogleRegisterDto extends GoogleLoginDto {
    role;
    firstName;
    lastName;
    phone;
    businessName;
}
exports.GoogleRegisterDto = GoogleRegisterDto;
__decorate([
    (0, class_validator_1.IsIn)(['client', 'stylist']),
    __metadata("design:type", String)
], GoogleRegisterDto.prototype, "role", void 0);
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], GoogleRegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, fields_1.TextField)(2, 80),
    __metadata("design:type", String)
], GoogleRegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], GoogleRegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.role === 'stylist' || dto.businessName !== undefined),
    (0, fields_1.TextField)(2, 120),
    __metadata("design:type", String)
], GoogleRegisterDto.prototype, "businessName", void 0);
class ChangeEmployeePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangeEmployeePasswordDto = ChangeEmployeePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], ChangeEmployeePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], ChangeEmployeePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map