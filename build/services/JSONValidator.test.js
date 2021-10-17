"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONValidator_1 = require("./JSONValidator");
describe("JSONValidator", () => {
    it("should work correctly with valid object", () => {
        const jsonValidator = new JSONValidator_1.JSONValidator();
        const schema = {
            type: "object",
            properties: { foo: { type: "string" } },
            required: ["foo"],
        };
        expect(jsonValidator.validate(schema, { foo: "bar" })).toBe(true);
    });
    it("should work correctly with invalid object", () => {
        const jsonValidator = new JSONValidator_1.JSONValidator();
        const schema = {
            type: "object",
            properties: { foo: { type: "string" } },
            required: ["foo"],
        };
        expect(jsonValidator.validate(schema, { bar: "bar" })).toBe(false);
    });
    it("should return errors for invalid object", () => {
        const jsonValidator = new JSONValidator_1.JSONValidator();
        const schema = {
            type: "object",
            properties: { foo: { type: "string" } },
            required: ["foo"],
        };
        expect(jsonValidator.getErrors(schema, { bar: "bar" })).toEqual([
            {
                instancePath: "",
                keyword: "required",
                message: "must have required property 'foo'",
                params: { missingProperty: "foo" },
                schemaPath: "#/required",
            },
        ]);
    });
});
