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
    let result = await controller.create({ headers: { xNaiveAuth: userId }, body });
    expect(result.status).toBe(201);
    expect(transportActivityMapper.transportActivities.length).toBe(1);
  });
});
