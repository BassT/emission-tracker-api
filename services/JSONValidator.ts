import Ajv, { ErrorObject, JSONSchemaType } from "ajv";
import addJSONSchemaStringFormats from "ajv-formats";

export class JSONValidator {
  ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addJSONSchemaStringFormats(this.ajv);
  }

  validate<Body>(schema: JSONSchemaType<Body>, obj: any | Body): obj is Body {
    const validate = this.ajv.compile(schema);
    return validate(obj);
  }

  getErrors(schema: any, obj: any): ErrorObject<string, Record<string, any>, unknown>[] | null | undefined {
    const validate = this.ajv.compile(schema);
    validate(obj);
    return validate.errors;
  }
}
