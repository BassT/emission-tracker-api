import { CalcMode } from "../enums/CalcMode";
import { FuelType } from "../enums/FuelType";

export class TransportActivity {
  id: string;
  title: string;
  date: Date;
  distance: number;
  specificEmissions: number;
  fuelType: FuelType;
  specificFuelConsumption: number;
  totalFuelConsumption: number;
  calcMode: CalcMode;
  persons: number;
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
    fuelType,
    specificFuelConsumption,
    totalFuelConsumption,
    calcMode,
    persons,
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
    fuelType: FuelType;
    specificFuelConsumption: number;
    totalFuelConsumption: number;
    calcMode: CalcMode;
    persons: number;
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
    this.fuelType = fuelType;
    this.specificFuelConsumption = specificFuelConsumption;
    this.totalFuelConsumption = totalFuelConsumption;
    this.calcMode = calcMode;
    this.persons = persons;
    this.totalEmissions = totalEmissions;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt;
  }
}
