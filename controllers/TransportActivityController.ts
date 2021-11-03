import { JSONSchemaType } from "ajv";
import { RequestHandler } from "express";
import { TransportActivity } from "../entities/TransportActivity";
import { TransportActivityMapper } from "../mappers/TransportActivityMapper";
import { Authenticator } from "../services/Authenticator";
import { JSONValidator } from "../services/JSONValidator";
import { v4 as generateUUID } from "uuid";
import { FuelType } from "../enums/FuelType";
import { CalcMode } from "../enums/CalcMode";

export class TransportActivityController {
  authenticator: Authenticator;
  jsonValidator: JSONValidator;
  transportActivityMapper: TransportActivityMapper;

  constructor({
    authenticator,
    jsonValidator,
    transportActivityMapper,
  }: {
    authenticator: Authenticator;
    jsonValidator: JSONValidator;
    transportActivityMapper: TransportActivityMapper;
  }) {
    this.authenticator = authenticator;
    this.jsonValidator = jsonValidator;
    this.transportActivityMapper = transportActivityMapper;
  }

  async create({
    headers,
    params,
  }: {
    headers: { xNaiveAuth?: string | string[] };
    params: any;
  }): Promise<CreateResponse> {
    const { userId, error } = await this.authenticator.authenticateRequest({ headers });
    if (error || !userId) return { status: 401, error };
    if (this.jsonValidator.validate<CreateBody>(createBodySchema, params)) {
      const transportActivity = new TransportActivity({
        ...params,
        id: generateUUID(),
        date: new Date(params.date),
        createdBy: userId,
      });
      await this.transportActivityMapper.save({ transportActivity });
      return { status: 201, transportActivity };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(createBodySchema, params) };
    }
  }

  async details({
    headers,
    params,
  }: {
    headers: { xNaiveAuth?: string | string[] };
    params: any;
  }): Promise<DetailsResponse> {
    const { userId, error } = await this.authenticator.authenticateRequest({ headers });
    if (error || !userId) return { status: 401, error };
    if (this.jsonValidator.validate<DetailsParams>(detailsParamsSchema, params)) {
      const transportActivity = await this.transportActivityMapper.get({ id: params.id });
      if (!transportActivity) return { status: 404, error: "Not found" };
      if (transportActivity.createdBy !== userId) return { status: 403, error: "Forbidden" };
      return { status: 200, transportActivity };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(createBodySchema, params) };
    }
  }

  async list({ headers, params }: { headers: { xNaiveAuth?: string | string[] }; params: any }): Promise<ListResponse> {
    const { userId, error } = await this.authenticator.authenticateRequest({ headers });
    if (error || !userId) return { status: 401, error };
    if (this.jsonValidator.validate<ListParams>(listParamsSchema, params)) {
      const transportActivities = await this.transportActivityMapper.list({
        filter: {
          createdBy: userId,
          dateAfter: params.dateAfter && typeof params.dateAfter === "string" ? params.dateAfter : undefined,
        },
      });
      const items = transportActivities.map((ta) => {
        let item: { id: string; title?: string; totalEmissions?: number; date?: Date } = { id: ta.id };
        if (params.title === "true") {
          item.title = ta.title;
        }
        if (params.totalEmissions === "true") {
          item.totalEmissions = ta.totalEmissions;
        }
        if (params.date === "true") {
          item.date = ta.date;
        }
        return item;
      });
      return { status: 200, items: items };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(listParamsSchema, params) };
    }
  }

  async update({
    headers,
    params,
  }: {
    headers: { xNaiveAuth?: string | string[] };
    params: any;
  }): Promise<UpdateResponse> {
    const { userId, error } = await this.authenticator.authenticateRequest({ headers });
    if (error || !userId) return { status: 401, error };
    if (this.jsonValidator.validate<UpdateParams>(updateParamsSchema, params)) {
      const transportActivity = await this.transportActivityMapper.get({ id: params.id });
      if (!transportActivity) return { status: 404, error: "Not found" };
      if (transportActivity.createdBy !== userId) return { status: 403, error: "Forbidden" };
      transportActivity.title = params.title;
      transportActivity.date = new Date(params.date);
      transportActivity.distance = params.distance;
      transportActivity.specificEmissions = params.specificEmissions;
      transportActivity.fuelType = params.fuelType;
      transportActivity.specificFuelConsumption = params.specificFuelConsumption;
      transportActivity.totalFuelConsumption = params.totalFuelConsumption;
      transportActivity.calcMode = params.calcMode;
      transportActivity.persons = params.persons;
      transportActivity.totalEmissions = params.totalEmissions;
      transportActivity.updatedAt = new Date();
      return { status: 200, transportActivity: await this.transportActivityMapper.save({ transportActivity }) };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(updateParamsSchema, params) };
    }
  }

  async delete({
    headers,
    params,
  }: {
    headers: { xNaiveAuth?: string | string[] };
    params: any;
  }): Promise<DeleteResponse> {
    const { userId, error } = await this.authenticator.authenticateRequest({ headers });
    if (error || !userId) return { status: 401, error };
    if (this.jsonValidator.validate<DeleteParams>(deleteParamsSchema, params)) {
      const transportActivity = await this.transportActivityMapper.get({ id: params.id });
      if (!transportActivity) return { status: 404, error: "Not found" };
      if (transportActivity.createdBy !== userId) return { status: 403, error: "Forbidden" };
      await this.transportActivityMapper.delete({ id: params.id });
      return { status: 204 };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(deleteParamsSchema, params) };
    }
  }
}

export interface CreateBody {
  title: string;
  date: string;
  distance: number;
  specificEmissions: number;
  fuelType: FuelType;
  specificFuelConsumption: number;
  totalFuelConsumption: number;
  calcMode: CalcMode;
  persons: number;
  totalEmissions: number;
}

const createBodySchema: JSONSchemaType<CreateBody> = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", format: "date-time" },
    distance: { type: "number" },
    specificEmissions: { type: "number" },
    fuelType: { type: "string", enum: [FuelType.Diesel, FuelType.Gasoline] },
    specificFuelConsumption: { type: "number" },
    totalFuelConsumption: { type: "number" },
    calcMode: { type: "string", enum: [CalcMode.SpecificEmissions, CalcMode.SpecificFuel, CalcMode.TotalFuel] },
    persons: { type: "number" },
    totalEmissions: { type: "number" },
  },
  required: ["title", "date"],
  additionalProperties: false,
};

interface CreateResponseCreated {
  status: 201;
  transportActivity: TransportActivity;
}

interface CreateResponseUnauthorized {
  status: 401;
  error?: string;
}

interface CreateResponseBadRequest {
  status: 400;
  errors?: any;
}

type CreateResponse = CreateResponseCreated | CreateResponseUnauthorized | CreateResponseBadRequest;

interface DetailsParams {
  id: string;
}

const detailsParamsSchema: JSONSchemaType<DetailsParams> = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
};

interface DetailsResponseOK {
  status: 200;
  transportActivity: TransportActivity;
}

interface DetailsResponseBadRequest {
  status: 400;
  errors?: any;
}

interface DetailsResponseUnauthorized {
  status: 401;
  error?: string;
}

interface DetailsResponseForbidden {
  status: 403;
  error?: string;
}

interface DetailsResponseNotFound {
  status: 404;
  error?: string;
}

type DetailsResponse =
  | DetailsResponseOK
  | DetailsResponseBadRequest
  | DetailsResponseUnauthorized
  | DetailsResponseForbidden
  | DetailsResponseNotFound;

interface ListParams {
  title?: "true";
  totalEmissions?: "true";
  date?: "true";
  dateAfter?: string;
}

const listParamsSchema: JSONSchemaType<ListParams> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true, enum: ["true"] },
    totalEmissions: { type: "string", nullable: true, enum: ["true"] },
    date: { type: "string", nullable: true, enum: ["true"] },
    dateAfter: { type: "string", nullable: true, format: "date-time" },
  },
};

interface ListItem {
  id: string;
  title?: string;
  totalEmissions?: number;
  date?: Date;
}

interface ListResponseOK {
  status: 200;
  items: ListItem[];
}

interface ListResponseBadRequest {
  status: 400;
  errors?: any;
}

interface ListResponseUnauthorized {
  status: 401;
  error?: string;
}

type ListResponse = ListResponseOK | ListResponseBadRequest | ListResponseUnauthorized;

interface UpdateParams {
  id: string;
  title: string;
  date: string;
  distance: number;
  specificEmissions: number;
  fuelType: FuelType;
  specificFuelConsumption: number;
  totalFuelConsumption: number;
  calcMode: CalcMode;
  persons: number;
  totalEmissions: number;
}

const updateParamsSchema: JSONSchemaType<UpdateParams> = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    date: { type: "string", format: "date-time" },
    distance: { type: "number" },
    specificEmissions: { type: "number" },
    fuelType: { type: "string", enum: [FuelType.Diesel, FuelType.Gasoline] },
    specificFuelConsumption: { type: "number" },
    totalFuelConsumption: { type: "number" },
    calcMode: { type: "string", enum: [CalcMode.SpecificEmissions, CalcMode.SpecificFuel, CalcMode.TotalFuel] },
    persons: { type: "number" },
    totalEmissions: { type: "number" },
  },
  required: ["id", "title", "date"],
  additionalProperties: false,
};

interface UpdateResponseOK {
  status: 200;
  transportActivity: TransportActivity;
}

interface UpdateResponseBadRequest {
  status: 400;
  errors?: any;
}

interface UpdateResponseUnauthroized {
  status: 401;
  error?: string;
}

interface UpdateResponseForbidden {
  status: 403;
  error?: string;
}

interface UpdateResponseNotFound {
  status: 404;
  error?: string;
}

type UpdateResponse =
  | UpdateResponseOK
  | UpdateResponseBadRequest
  | UpdateResponseUnauthroized
  | UpdateResponseForbidden
  | UpdateResponseNotFound;

interface DeleteParams {
  id: string;
}

const deleteParamsSchema: JSONSchemaType<DeleteParams> = {
  type: "object",
  properties: { id: { type: "string" } },
  required: ["id"],
  additionalProperties: false,
};

interface DeleteResponseNoContent {
  status: 204;
}

interface DeleteResponseBadRequest {
  status: 400;
  errors?: any;
}

interface DeleteResponseUnauthorized {
  status: 401;
  error?: string;
}

interface DeleteResponseForbidden {
  status: 403;
  error?: string;
}

interface DeleteResponseNotFound {
  status: 404;
  error?: string;
}

type DeleteResponse =
  | DeleteResponseNoContent
  | DeleteResponseBadRequest
  | DeleteResponseUnauthorized
  | DeleteResponseForbidden
  | DeleteResponseNotFound;
