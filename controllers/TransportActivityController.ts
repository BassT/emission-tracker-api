import { JSONSchemaType } from "ajv";
import { RequestHandler } from "express";
import { TransportActivity } from "../entities/TransportActivity";
import { TransportActivityMapper } from "../mappers/TransportActivityMapper";
import { Authenticator } from "../services/Authenticator";
import { JSONValidator } from "../services/JSONValidator";
import { v4 as generateUUID } from "uuid";

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
        const result = await this.transportActivityMapper.list({
          filter: { createdBy: userId },
          select: { title: req.query.title === "true" ? true : false },
        });
        return res.status(200).json(result);
      } else {
        return res.status(400).json(this.jsonValidator.getErrors(listBodySchema, req.body));
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
  required: ["title", "date", "distance", "specificEmissions", "totalEmissions"],
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
}

const listBodySchema: JSONSchemaType<ListBody> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true, enum: ["true"] },
  },
};
