export class TransportActivity {
  id: string;
  title: string;
  date: Date;
  distance: number;
  specificEmissions: number;
  totalEmissions: number;

  constructor({
    id,
    title,
    date,
    distance,
    specificEmissions,
    totalEmissions,
  }: {
    id: string;
    title: string;
    date: Date;
    distance: number;
    specificEmissions: number;
    totalEmissions: number;
  }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.distance = distance;
    this.specificEmissions = specificEmissions;
    this.totalEmissions = totalEmissions;
  }
}
