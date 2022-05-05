import { CalcMode } from "../enums/CalcMode";
import { FuelType } from "../enums/FuelType";
import { TransportMode } from "../enums/TransportMode";

export class TransportActivity {
  id: string;
  title: string;
  date: Date;
  transportMode?: TransportMode;
  distance?: number;
  specificEmissions?: number;
  fuelType?: FuelType;
  specificFuelConsumption?: number;
  totalFuelConsumption?: number;
  calcMode?: CalcMode;
  persons?: number;
  capacityUtilization?: number;
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
    totalEmissions,
    distance,
    specificEmissions,
    fuelType,
    specificFuelConsumption,
    totalFuelConsumption,
    calcMode,
    persons,
    capacityUtilization,
    transportMode,
    createdBy,
    createdAt,
    updatedAt,
  }: {
    id: string;
    title: string;
    date: Date;
    totalEmissions: number;
    distance?: number;
    specificEmissions?: number;
    fuelType?: FuelType;
    specificFuelConsumption?: number;
    totalFuelConsumption?: number;
    calcMode?: CalcMode;
    persons?: number;
    capacityUtilization?: number;
    transportMode?: TransportMode;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.totalEmissions = totalEmissions;
    this.distance = distance;
    this.specificEmissions = specificEmissions;
    this.fuelType = fuelType;
    this.specificFuelConsumption = specificFuelConsumption;
    this.totalFuelConsumption = totalFuelConsumption;
    this.calcMode = calcMode;
    this.persons = persons;
    this.capacityUtilization = capacityUtilization;
    this.transportMode = transportMode;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt;
  }
}
