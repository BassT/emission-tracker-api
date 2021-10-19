import mongoose, { FilterQuery, model, Schema } from "mongoose";
import { TransportActivity } from "../entities/TransportActivity";
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
}

export class InMemoryTransportActitiyMapper implements TransportActivityMapper {
  transportActivities: TransportActivity[] = [];
  logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
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
    this.logger.log(`${InMemoryTransportActitiyMapper.name}: Saved ${JSON.stringify(transportActivity, null, 2)}`);
    return transportActivity;
  }
}

export class CosmosDBTransportActivityMapper implements TransportActivityMapper {
  static instance: CosmosDBTransportActivityMapper;

  static async getInstance() {
    if (!process.env.MONGO_URL) {
      throw new Error("Missing environment variable MONGO_URL");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log(CosmosDBTransportActivityMapper.name, "Connected");
    if (!CosmosDBTransportActivityMapper.instance) {
      CosmosDBTransportActivityMapper.instance = new CosmosDBTransportActivityMapper();
    }
    return CosmosDBTransportActivityMapper.instance;
  }

  private constructor() {}

  async get(params: { id: string }): Promise<TransportActivity | undefined> {
    const doc = await TransportActivityModel.findOne({ id: params.id });
    if (!doc) return undefined;
    return new TransportActivity(doc);
  }

  async list(params: ListParams): Promise<TransportActivity[]> {
    let filter: FilterQuery<TransportActivity> = {};
    if (params.filter.createdBy) {
      filter = { createdBy: params.filter.createdBy };
    }
    if (params.filter.dateAfter) {
      filter = { date: { $gt: new Date(params.filter.dateAfter) } };
    }
    const docs = await TransportActivityModel.find(filter);
    return docs.map((doc) => new TransportActivity(doc));
  }

  async save(params: { transportActivity: TransportActivity }): Promise<TransportActivity> {
    const doc = new TransportActivityModel({ ...params.transportActivity });
    await doc.save();
    return new TransportActivity(doc);
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
    totalEmissions: Number,
    createdBy: String,
    createdAt: Date,
    updatedAt: Date,
  })
);
