import { TransportActivity } from "../entities/TransportActivity";
import { CalcMode } from "../enums/CalcMode";
import { FuelType } from "../enums/FuelType";
import { InMemoryTransportActivityMapper } from "../mappers/TransportActivityMapper";
import { JSONValidator } from "../services/JSONValidator";
import { CreateBody, TransportActivityController } from "./TransportActivityController";

describe("create", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const jsonValidator = new JSONValidator();
    const transportActivityMapper = new InMemoryTransportActivityMapper({ logger: console });
    const controller = new TransportActivityController({ jsonValidator, transportActivityMapper });
    const body: CreateBody = {
      title: "Car drive",
      date: new Date().toISOString(),
      totalEmissions: 0,
      calcMode: CalcMode.SpecificEmissions,
      distance: 0,
      fuelType: FuelType.Diesel,
      persons: 1,
      specificEmissions: 0,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    };
    const result = await controller.create({ userId, params: body });
    expect(result.status).toBe(201);
    expect(transportActivityMapper.transportActivities.length).toBe(1);
  });
});

describe("details", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const jsonValidator = new JSONValidator();
    const transportActivity = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      totalEmissions: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity],
    });
    const controller = new TransportActivityController({ jsonValidator, transportActivityMapper });
    const result = await controller.details({ userId, params: { id: transportActivity.id } });
    expect(result.status).toBe(200);
  });
});

describe("list", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const jsonValidator = new JSONValidator();
    const transportActivity1 = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      totalEmissions: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    });
    const transportActivity2 = new TransportActivity({
      id: "test-2",
      title: "test 2",
      date: new Date(),
      totalEmissions: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity1, transportActivity2],
    });
    const controller = new TransportActivityController({ jsonValidator, transportActivityMapper });
    const result = await controller.list({ userId, params: {} });
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.items).toHaveLength(2);
    } else {
      throw new Error();
    }
  });
});

describe("update", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const jsonValidator = new JSONValidator();
    const transportActivity = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      totalFuelConsumption: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      capacityUtilization: 0.5,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity],
    });
    const controller = new TransportActivityController({ jsonValidator, transportActivityMapper });
    const result = await controller.update({
      userId,
      params: {
        id: transportActivity.id,
        title: "test 2",
        date: new Date().toISOString(),
        totalEmissions: transportActivity.totalEmissions,
        distance: transportActivity.distance,
        specificEmissions: transportActivity.specificEmissions,
        fuelType: transportActivity.fuelType,
        calcMode: transportActivity.calcMode,
        persons: transportActivity.persons,
        specificFuelConsumption: transportActivity.specificFuelConsumption,
        totalFuelConsumption: transportActivity.totalFuelConsumption,
        capacityUtilization: transportActivity.capacityUtilization,
      },
    });
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.transportActivity.title).toBe("test 2");
    } else {
      throw new Error();
    }
  });
});

describe("delete", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const jsonValidator = new JSONValidator();
    const transportActivity1 = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      totalEmissions: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    });
    const transportActivity2 = new TransportActivity({
      id: "test-2",
      title: "test 2",
      date: new Date(),
      totalEmissions: 0,
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalFuelConsumption: 0,
      capacityUtilization: 0.5,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity1, transportActivity2],
    });
    const controller = new TransportActivityController({ jsonValidator, transportActivityMapper });
    const result = await controller.delete({ userId, params: { id: transportActivity1.id } });
    expect(result.status).toBe(204);
    expect(transportActivityMapper.transportActivities).toHaveLength(1);
    expect(transportActivityMapper.transportActivities[0].id).toBe(transportActivity2.id);
  });
});
