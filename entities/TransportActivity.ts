export class TransportActivity {
  id: string;
  title: string;
  date: Date;
  distance: number;
  specificEmissions: number;
  totalEmissions: number;
  /**
   * ID of user who created this transport activity.
   */
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor({
    id,
    title,
    date,
    distance,
    specificEmissions,
    totalEmissions,
    createdBy,
    createdAt,
    updatedAt,
  }: {
    id: string;
    title: string;
    date: Date;
    distance: number;
    specificEmissions: number;
    totalEmissions: number;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.distance = distance;
    this.specificEmissions = specificEmissions;
    this.totalEmissions = totalEmissions;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt;
  }
}
