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

  generateCreateHandler(): RequestHandler {
    return async (req, res) => {
      const { userId, error } = await this.authenticator.authenticateRequest(req);
      if (error || !userId) return res.status(401).send(error);
      if (this.jsonValidator.validate<CreateBody>(createBodySchema, req.body)) {
        const transportActivity = new TransportActivity({
          ...req.body,
          id: generateUUID(),
          date: new Date(req.body.date),
          createdBy: userId,
        });
        await this.transportActivityMapper.save({ transportActivity });
        res.setHeader("location", `http://${req.headers.host}/api/transport-activity/${transportActivity.id}`);
        return res.status(201).send("Created.");
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(createBodySchema, req.body));
      }
    };
  }

  generateDetailsHandler(): RequestHandler {
    return async (req, res) => {
      const { userId, error } = await this.authenticator.authenticateRequest(req);
      if (error || !userId) return res.status(401).send(error);
      if (this.jsonValidator.validate<DetailsBody>(detailsBodySchema, req.params)) {
        const transportActivity = await this.transportActivityMapper.get({ id: req.params.id });
        if (!transportActivity) return res.status(404).send("Not found.");
        return res.status(200).json(transportActivity);
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(createBodySchema, req.body));
      }
    };
  }

  generateListHandler(): RequestHandler {
    return async (req, res) => {
      const { userId, error } = await this.authenticator.authenticateRequest(req);
      if (error || !userId) return res.status(401).send(error);
      if (this.jsonValidator.validate<ListBody>(listBodySchema, req.query)) {
        const transportActivities = await this.transportActivityMapper.list({
          filter: {
            createdBy: userId,
            dateAfter: req.query.dateAfter && typeof req.query.dateAfter === "string" ? req.query.dateAfter : undefined,
          },
        });
        const result = transportActivities.map((ta) => {
          let item: { id: string; title?: string; totalEmissions?: number; date?: Date } = { id: ta.id };
          if (req.query.title === "true") {
            item.title = ta.title;
          }
          if (req.query.totalEmissions === "true") {
            item.totalEmissions = ta.totalEmissions;
          }
          if (req.query.date === "true") {
            item.date = ta.date;
          }
          return item;
        });
        return res.status(200).json(result);
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(listBodySchema, req.body));
      }
    };
  }

  generateUpdateHandler(): RequestHandler {
    return async (req, res) => {
      const { userId, error } = await this.authenticator.authenticateRequest(req);
      if (error || !userId) return res.status(401).send(error);
      const params = { ...req.body, ...req.params };
      if (this.jsonValidator.validate<UpdateParams>(updateParamsSchema, params)) {
        const transportActivity = await this.transportActivityMapper.get({ id: params.id });
        if (!transportActivity) return res.status(404).send("Not found.");
        if (transportActivity.createdBy !== userId) return res.status(403).send("Forbidden");
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
        return res.status(200).send(await this.transportActivityMapper.save({ transportActivity }));
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(updateParamsSchema, params));
      }
    };
  }

  generateDeleteHandler(): RequestHandler {
    return async (req, res) => {
      const { userId, error } = await this.authenticator.authenticateRequest(req);
      if (error || !userId) return res.status(401).send(error);
      if (this.jsonValidator.validate<DeleteParams>(deleteParamsSchema, req.params)) {
        const transportActivity = await this.transportActivityMapper.get({ id: req.params.id });
        if (!transportActivity) return res.status(404).send("Not found.");
        await this.transportActivityMapper.delete({ id: req.params.id });
        return res.status(204).send();
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(deleteParamsSchema, req.params));
      }
    };
  }
}

interface CreateBody {
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

interface DetailsBody {
  id: string;
}

const detailsBodySchema: JSONSchemaType<DetailsBody> = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
};

interface ListBody {
  title?: "true";
  totalEmissions?: "true";
  date?: "true";
  dateAfter?: string;
}

const listBodySchema: JSONSchemaType<ListBody> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true, enum: ["true"] },
    totalEmissions: { type: "string", nullable: true, enum: ["true"] },
    date: { type: "string", nullable: true, enum: ["true"] },
    dateAfter: { type: "string", nullable: true, format: "date-time" },
  },
};

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

interface DeleteParams {
  id: string;
}

const deleteParamsSchema: JSONSchemaType<DeleteParams> = {
  type: "object",
  properties: { id: { type: "string" } },
  required: ["id"],
  additionalProperties: false,
};
