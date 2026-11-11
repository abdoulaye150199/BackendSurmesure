"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalField = OptionalField;
exports.TextField = TextField;
exports.NumericField = NumericField;
exports.IsImageLocation = IsImageLocation;
exports.validImageLocation = validImageLocation;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function OptionalField() {
    return (0, class_validator_1.ValidateIf)((_object, value) => value !== undefined);
}
function TextField(min = 1, max = 160) {
    return (0, common_1.applyDecorators)((0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(min), (0, class_validator_1.MaxLength)(max));
}
function NumericField() {
    return (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' && value.trim() ? Number(value) : value);
}
function IsImageLocation(allowEmpty = false, options) {
    return (target, propertyKey) => (0, class_validator_1.registerDecorator)({
        name: 'isImageLocation',
        target: target.constructor,
        propertyName: String(propertyKey),
        options,
        validator: {
            validate: (value) => validImageLocation(value, allowEmpty),
            defaultMessage: () => 'Image invalide : utilisez une URL HTTP(S), un fichier PNG, JPEG ou WebP encodé, ou un chemin /assets/.',
        },
    });
}
function validImageLocation(value, allowEmpty = false) {
    if (typeof value !== 'string' || value.length > 100_000) {
        return false;
    }
    if (!value) {
        return allowEmpty;
    }
    if (/^\/assets\/[a-z\d_./-]+$/i.test(value) && !value.includes('..')) {
        return true;
    }
    if (/^data:image\/(png|jpeg|webp);base64,[a-z\d+/]+={0,2}$/i.test(value)) {
        return true;
    }
    try {
        const url = new URL(value);
        return (['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=fields.js.map