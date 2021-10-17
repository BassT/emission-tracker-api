"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONValidator = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class JSONValidator {
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true });
        (0, ajv_formats_1.default)(this.ajv);
    }
    validate(schema, obj) {
        const validate = this.ajv.compile(schema);
        return validate(obj);
    }
    getErrors(schema, obj) {
        const validate = this.ajv.compile(schema);
        validate(obj);
        return validate.errors;
    }
}
exports.JSONValidator = JSONValidator;
