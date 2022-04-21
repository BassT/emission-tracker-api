import { JSONSchemaType } from "ajv";
import { TransportActivity } from "../entities/TransportActivity";
import { TransportActivityMapper } from "../mappers/TransportActivityMapper";
import { JSONValidator } from "../services/JSONValidator";
import { v4 as generateUUID } from "uuid";
import { FuelType } from "../enums/FuelType";
import { CalcMode } from "../enums/CalcMode";

export class TransportActivityController {
  jsonValidator: JSONValidator;
  transportActivityMapper: TransportActivityMapper;

  constructor({
    jsonValidator,
    transportActivityMapper,
  }: {
    jsonValidator: JSONValidator;
    transportActivityMapper: TransportActivityMapper;
  }) {
    this.jsonValidator = jsonValidator;
    this.transportActivityMapper = transportActivityMapper;
  }

  async create({ userId, params }: { userId?: string; params: any }): Promise<CreateResponse> {
    if (!userId) return { status: 401 };
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

  async details({ userId, params }: { userId?: string; params: any }): Promise<DetailsResponse> {
    if (!userId) return { status: 401 };
    if (this.jsonValidator.validate<DetailsParams>(detailsParamsSchema, params)) {
      const transportActivity = await this.transportActivityMapper.get({ id: params.id });
      if (!transportActivity) return { status: 404, error: "Not found" };
      if (transportActivity.createdBy !== userId) return { status: 403, error: "Forbidden" };
      return { status: 200, transportActivity };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(createBodySchema, params) };
    }
  }

  async list({ userId, params }: { userId?: string; params: any }): Promise<ListResponse> {
    if (!userId) return { status: 401 };
    if (this.jsonValidator.validate<ListParams>(listParamsSchema, params)) {
      let transportActivities = await this.transportActivityMapper.list({
        filter: {
          createdBy: userId,
          dateAfter: params.dateAfter && typeof params.dateAfter === "string" ? params.dateAfter : undefined,
        },
      });
      if (params.sortBy === "date") {
        transportActivities = transportActivities.sort((a, b) => {
          switch (params.sortDirection) {
            case "ASC":
              return a.date.getTime() - b.date.getTime();
            case "DESC":
              return b.date.getTime() - a.date.getTime();
            default:
              return a.date.getTime() - b.date.getTime();
          }
        });
      }
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
      return { status: 200, items };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(listParamsSchema, params) };
    }
  }

  async update({ userId, params }: { userId?: string; params: any }): Promise<UpdateResponse> {
    if (!userId) return { status: 401 };
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

  async delete({ userId, params }: { userId?: string; params: any }): Promise<DeleteResponse> {
    if (!userId) return { status: 401 };
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

  async import({ userId, params }: { userId?: string; params: any }): Promise<ImportResponse> {
    if (!userId) return { status: 401 };
    if (this.jsonValidator.validate<ImportParams>(importParamsSchema, params)) {
      const transportActivities = params.data
        .filter((value) => value.createdBy === userId)
        .map(
          (value) =>
            new TransportActivity({
              ...value,
              date: new Date(value.date.$date),
              createdAt: new Date(value.createdAt.$date),
              updatedAt: value.updatedAt ? new Date(value.updatedAt.$date) : undefined,
            })
        );
      for (const transportActivity of transportActivities) {
        await this.transportActivityMapper.save({ transportActivity });
      }
      return { status: 200, message: `Imported ${transportActivities.length} transport activities successfully.` };
    } else {
      return { status: 400, errors: this.jsonValidator.getErrors(importParamsSchema, params) };
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
  sortBy?: "date";
  sortDirection?: "ASC" | "DESC";
}

const listParamsSchema: JSONSchemaType<ListParams> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true, enum: ["true"] },
    totalEmissions: { type: "string", nullable: true, enum: ["true"] },
    date: { type: "string", nullable: true, enum: ["true"] },
    dateAfter: { type: "string", nullable: true, format: "date-time" },
    sortBy: { type: "string", nullable: true, enum: ["date"] },
    sortDirection: { type: "string", nullable: true, enum: ["ASC", "DESC"] },
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

interface ImportParams {
  data: Array<{
    id: string;
    title: string;
    date: {
      $date: string;
    };
    distance: number;
    specificEmissions: 0;
    fuelType: FuelType;
    specificFuelConsumption: number;
    totalFuelConsumption: number;
    calcMode: CalcMode;
    persons: number;
    totalEmissions: number;
    createdBy: string;
    createdAt: {
      $date: string;
    };
    updatedAt?: {
      $date: string;
    };
  }>;
}

const importParamsSchema: JSONSchemaType<ImportParams> = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        required: [
          "id",
          "title",
          "date",
          "distance",
          "specificEmissions",
          "fuelType",
          "specificFuelConsumption",
          "totalFuelConsumption",
          "calcMode",
          "persons",
          "totalEmissions",
          "createdBy",
          "createdAt",
        ],
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          date: {
            type: "object",
            required: ["$date"],
            properties: {
              $date: {
                type: "string",
                format: "date-time",
              },
            },
            additionalProperties: false,
          },
          distance: {
            type: "number",
          },
          specificEmissions: {
            type: "number",
          },
          fuelType: {
            type: "string",
          },
          specificFuelConsumption: {
            type: "number",
          },
          totalFuelConsumption: {
            type: "number",
          },
          calcMode: {
            type: "string",
          },
          persons: {
            type: "integer",
          },
          totalEmissions: {
            type: "number",
          },
          createdBy: {
            type: "string",
          },
          createdAt: {
            type: "object",
            required: ["$date"],
            properties: {
              $date: {
                type: "string",
              },
            },
            additionalProperties: false,
          },
          updatedAt: {
            type: "object",
            required: ["$date"],
            properties: {
              $date: {
                type: "string",
              },
            },
            additionalProperties: false,
            nullable: true,
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

interface ImportResponseOK {
  status: 200;
  message: string;
}

interface ImportResponseUnauthorized {
  status: 401;
}

interface ImportResponseBadRequest {
  status: 400;
  errors?: any;
}

type ImportResponse = ImportResponseOK | ImportResponseUnauthorized | ImportResponseBadRequest;
