import mongoose, { FilterQuery, model, Schema } from "mongoose";
import { TransportActivity } from "../entities/TransportActivity";
import { CalcMode } from "../enums/CalcMode";
import { FuelType } from "../enums/FuelType";
import { TransportMode } from "../enums/TransportMode";
import { Logger } from "../services/Logger";

interface ListParams {
  filter: {
    createdBy?: string;
    dateAfter?: string;
  };
}

export interface TransportActivityMapper {
  get(params: { id: string }): Promise<TransportActivity | undefined>;
  list(params: ListParams): Promise<TransportActivity[]>;
  save(params: { transportActivity: TransportActivity }): Promise<TransportActivity>;
  delete(params: { id: string }): Promise<void>;
}

export class InMemoryTransportActivityMapper implements TransportActivityMapper {
  transportActivities: TransportActivity[] = [];
  logger: Logger;

  constructor({ logger, transportActivites = [] }: { logger: Logger; transportActivites?: TransportActivity[] }) {
    this.logger = logger;
    this.transportActivities = transportActivites;
  }

  async get({ id }: { id: string }): Promise<TransportActivity | undefined> {
    return this.transportActivities.find((item) => item.id === id);
  }

  async list({ filter }: ListParams): Promise<TransportActivity[]> {
    return this.transportActivities.filter((item) => {
      if (filter.createdBy && filter.createdBy !== item.createdBy) return false;
      if (filter.dateAfter && new Date(filter.dateAfter).getTime() > item.date.getTime()) return false;
      return true;
    });
  }

  async save({ transportActivity }: { transportActivity: TransportActivity }): Promise<TransportActivity> {
    const idx = this.transportActivities.findIndex((item) => item.id === transportActivity.id);
    if (idx === -1) {
      this.transportActivities = [...this.transportActivities, transportActivity];
    } else {
      this.transportActivities = [
        ...this.transportActivities.slice(0, idx),
        transportActivity,
        ...this.transportActivities.slice(idx + 1),
      ];
    }
    return transportActivity;
  }

  async delete(params: { id: string }): Promise<void> {
    this.transportActivities = this.transportActivities.filter((item) => item.id !== params.id);
  }
}

export class CosmosDBTransportActivityMapper implements TransportActivityMapper {
  static instance: CosmosDBTransportActivityMapper;

  static async getInstance() {
    if (!process.env.MONGO_URL) {
      throw new Error("Missing environment variable MONGO_URL");
    }
    if (!process.env.DB_NAME) {
      throw new Error("Missing environment variable DB_NAME");
    }
    await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DB_NAME });
    console.log(CosmosDBTransportActivityMapper.name, "Connected");
    if (!CosmosDBTransportActivityMapper.instance) {
      CosmosDBTransportActivityMapper.instance = new CosmosDBTransportActivityMapper();
    }
    return CosmosDBTransportActivityMapper.instance;
  }

  private constructor() {}

  async delete(params: { id: string }): Promise<void> {
    await TransportActivityModel.findOneAndDelete({ id: params.id });
  }

  async get(params: { id: string }): Promise<TransportActivity | undefined> {
    const doc = await TransportActivityModel.findOne({ id: params.id });
    if (!doc) return undefined;
    return new TransportActivity(doc);
  }

  async list(params: ListParams): Promise<TransportActivity[]> {
    let filter: FilterQuery<TransportActivity> = {};
    if (params.filter.createdBy) {
      filter = { ...filter, createdBy: params.filter.createdBy };
    }
    if (params.filter.dateAfter) {
      filter = { ...filter, date: { $gt: new Date(params.filter.dateAfter) } };
    }
    const docs = await TransportActivityModel.find(filter);
    return docs.map((doc) => new TransportActivity(doc));
  }

  async save(params: { transportActivity: TransportActivity }): Promise<TransportActivity> {
    let doc = await TransportActivityModel.findOne({ id: params.transportActivity.id });
    if (!doc) {
      doc = new TransportActivityModel({ ...params.transportActivity });
    } else {
      doc = this.updateDoc({ doc, ...params.transportActivity });
    }
    await doc.save();
    return new TransportActivity(doc);
  }

  private updateDoc({
    doc,
    title,
    date,
    distance,
    specificEmissions,
    fuelType,
    specificFuelConsumption,
    totalFuelConsumption,
    calcMode,
    persons,
    capacityUtilization,
    transportMode,
    totalEmissions,
    updatedAt,
  }: {
    doc: mongoose.Document<any, any, TransportActivity> &
      TransportActivity & {
        _id: mongoose.Types.ObjectId;
      };
    title: string;
    date: Date;
    distance?: number;
    specificEmissions?: number;
    fuelType?: FuelType;
    specificFuelConsumption?: number;
    totalFuelConsumption?: number;
    calcMode?: CalcMode;
    persons?: number;
    capacityUtilization?: number;
    transportMode?: TransportMode;
    totalEmissions: number;
    updatedAt?: Date;
  }) {
    doc.title = title;
    doc.date = date;
    doc.distance = distance;
    doc.specificEmissions = specificEmissions;
    doc.fuelType = fuelType;
    doc.specificFuelConsumption = specificFuelConsumption;
    doc.totalFuelConsumption = totalFuelConsumption;
    doc.calcMode = calcMode;
    doc.persons = persons;
    doc.capacityUtilization = capacityUtilization;
    doc.transportMode = transportMode;
    doc.totalEmissions = totalEmissions;
    doc.updatedAt = updatedAt;
    return doc;
  }
}

const TransportActivityModel = model<TransportActivity>(
  "TransportActivity",
  new Schema<TransportActivity>({
    id: String,
    title: String,
    date: Date,
    distance: Number,
    specificEmissions: Number,
    fuelType: String,
    specificFuelConsumption: Number,
    totalFuelConsumption: Number,
    calcMode: String,
    persons: Number,
    capacityUtilization: Number,
    transportMode: String,
    totalEmissions: Number,
    createdBy: String,
    createdAt: Date,
    updatedAt: Date,
  })
);
