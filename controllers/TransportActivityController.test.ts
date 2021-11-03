import { TransportActivity } from "../entities/TransportActivity";
import { CalcMode } from "../enums/CalcMode";
import { FuelType } from "../enums/FuelType";
import { InMemoryTransportActivityMapper } from "../mappers/TransportActivityMapper";
import { MockAuthenticatorBuilder } from "../services/Authenticator";
import { JSONValidator } from "../services/JSONValidator";
import { CreateBody, TransportActivityController } from "./TransportActivityController";

describe("create", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const authenticator = new MockAuthenticatorBuilder().withUserId(userId).build();
    const jsonValidator = new JSONValidator();
    const transportActivityMapper = new InMemoryTransportActivityMapper({ logger: console });
    const controller = new TransportActivityController({ authenticator, jsonValidator, transportActivityMapper });
    const body: CreateBody = {
      calcMode: CalcMode.SpecificEmissions,
      date: new Date().toISOString(),
      distance: 0,
      fuelType: FuelType.Diesel,
      persons: 1,
      specificEmissions: 0,
      specificFuelConsumption: 0,
      title: "Car drive",
      totalEmissions: 0,
      totalFuelConsumption: 0,
    };
    const result = await controller.create({ headers: { xNaiveAuth: userId }, params: body });
    expect(result.status).toBe(201);
    expect(transportActivityMapper.transportActivities.length).toBe(1);
  });
});

describe("details", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const authenticator = new MockAuthenticatorBuilder().withUserId(userId).build();
    const jsonValidator = new JSONValidator();
    const transportActivity = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity],
    });
    const controller = new TransportActivityController({ authenticator, jsonValidator, transportActivityMapper });
    const result = await controller.details({ headers: { xNaiveAuth: userId }, params: { id: transportActivity.id } });
    expect(result.status).toBe(200);
  });
});

describe("list", () => {
  it("should work correctly", async () => {
    const userId = "test-user-123";
    const authenticator = new MockAuthenticatorBuilder().withUserId(userId).build();
    const jsonValidator = new JSONValidator();
    const transportActivity1 = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivity2 = new TransportActivity({
      id: "test-2",
      title: "test 2",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity1, transportActivity2],
    });
    const controller = new TransportActivityController({ authenticator, jsonValidator, transportActivityMapper });
    const result = await controller.list({ headers: { xNaiveAuth: userId }, params: {} });
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
    const authenticator = new MockAuthenticatorBuilder().withUserId(userId).build();
    const jsonValidator = new JSONValidator();
    const transportActivity = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity],
    });
    const controller = new TransportActivityController({ authenticator, jsonValidator, transportActivityMapper });
    const result = await controller.update({
      headers: { xNaiveAuth: userId },
      params: {
        id: transportActivity.id,
        title: "test 2",
        date: new Date().toISOString(),
        distance: transportActivity.distance,
        specificEmissions: transportActivity.specificEmissions,
        fuelType: transportActivity.fuelType,
        calcMode: transportActivity.calcMode,
        persons: transportActivity.persons,
        specificFuelConsumption: transportActivity.specificFuelConsumption,
        totalEmissions: transportActivity.totalEmissions,
        totalFuelConsumption: transportActivity.totalFuelConsumption,
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
    const authenticator = new MockAuthenticatorBuilder().withUserId(userId).build();
    const jsonValidator = new JSONValidator();
    const transportActivity1 = new TransportActivity({
      id: "test",
      title: "test",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivity2 = new TransportActivity({
      id: "test-2",
      title: "test 2",
      date: new Date(),
      distance: 0,
      specificEmissions: 0,
      fuelType: FuelType.Diesel,
      calcMode: CalcMode.SpecificEmissions,
      createdBy: userId,
      persons: 1,
      specificFuelConsumption: 0,
      totalEmissions: 0,
      totalFuelConsumption: 0,
    });
    const transportActivityMapper = new InMemoryTransportActivityMapper({
      logger: console,
      transportActivites: [transportActivity1, transportActivity2],
    });
    const controller = new TransportActivityController({ authenticator, jsonValidator, transportActivityMapper });
    const result = await controller.delete({ headers: { xNaiveAuth: userId }, params: { id: transportActivity1.id } });
    expect(result.status).toBe(204);
    expect(transportActivityMapper.transportActivities).toHaveLength(1);
    expect(transportActivityMapper.transportActivities[0].id).toBe(transportActivity2.id);
  });
});
