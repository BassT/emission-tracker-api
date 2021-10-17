import { TransportActivity } from "../entities/TransportActivity";
import { Logger } from "../services/Logger";

export interface TransportActivityMapper {
  get(params: { id: string }): Promise<TransportActivity | undefined>;
  list(params: {
    filter: { createdBy?: string };
    select: { title?: boolean };
  }): Promise<{ id: string; title?: string }[]>;
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

  async list({
    filter,
    select,
  }: {
    filter: { createdBy?: string };
    select: { title?: boolean };
  }): Promise<{ id: string; title?: string }[]> {
    let activities = this.transportActivities;
    if (filter.createdBy) {
      activities = activities.filter((item) => item.createdBy === filter.createdBy);
    }
    const results = activities.map<{ id: string; title?: string }>((item) => {
      let result: { id: string; title?: string } = { id: item.id };
      if (select.title) {
        result = { ...result, title: item.title };
      }
      return result;
    });
    return results;
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
