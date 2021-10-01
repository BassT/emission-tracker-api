import { TransportActivity } from "../entities/TransportActivity";
import { Logger } from "../services/Logger";

export interface TransportActivityMapper {
  save({ transportActivity }: { transportActivity: TransportActivity }): Promise<TransportActivity>;
}

export class InMemoryTransportActitiyMapper implements TransportActivityMapper {
  transportActivities: TransportActivity[] = [];
  logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
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
