import express from "express";
import swaggerUi from "swagger-ui-express";
import { TransportActivityController } from "./controllers/TransportActivityController";
import { CosmosDBTransportActivityMapper } from "./mappers/TransportActivityMapper";
import { NaiveAuthenticator } from "./services/Authenticator";
import { JSONValidator } from "./services/JSONValidator";
import swaggerDoc from "./openapi.json";

if (!process.env.MONGO_URL) {
  const secrets = require("./secrets.json");
  process.env.MONGO_URL = secrets.MONGO_URL;
}

async function main() {
  // const logger: Logger = { log: console.log };
  const authenticator = new NaiveAuthenticator();
  // const transportActivityMapper: TransportActivityMapper = new InMemoryTransportActitiyMapper({ logger });
  const transportActivityMapper = await CosmosDBTransportActivityMapper.getInstance();
  const jsonValidator = new JSONValidator();
  const transportActivityController = new TransportActivityController({
    authenticator,
    jsonValidator,
    transportActivityMapper,
  });

  const port = process.env.PORT || 3000;
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    const { name = "World" } = req.query;
    res.send(`Hello ${name}!`);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.post("/api/transport-activity", transportActivityController.generateCreateHandler());
  app.get("/api/transport-activity", transportActivityController.generateListHandler());
  app.get("/api/transport-activity/:id", transportActivityController.generateDetailsHandler());

  app.listen(port, () => {
    console.log(`App listening at port ${port}`);
    console.log("Navigate to /docs to interact with API");
  });
}

main();
