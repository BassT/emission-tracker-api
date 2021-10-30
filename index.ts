import arg from "arg";
import morgan from "morgan";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { TransportActivityController } from "./controllers/TransportActivityController";
import { CosmosDBTransportActivityMapper } from "./mappers/TransportActivityMapper";
import { NaiveAuthenticator } from "./services/Authenticator";
import { JSONValidator } from "./services/JSONValidator";
import swaggerDoc from "./openapi.json";

const args = arg({
  "--secretsPath": String,
});

if (!process.env.MONGO_URL) {
  const secretsPath = args["--secretsPath"];
  if (!secretsPath) {
    throw new Error("Missing command line argument --secretsPath");
  }
  const secrets = require(secretsPath);
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
  app.use(morgan("dev"));

  app.get("/", (req, res) => {
    const { name = "World" } = req.query;
    res.send(`Hello ${name}!`);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.post("/api/transport-activity", async (req, res) => {
    const result = await transportActivityController.create({
      headers: { xNaiveAuth: req.headers["x-naive-auth"] },
      body: req.body,
    });
    switch (result.status) {
      case 201:
        res.setHeader("location", `http://${req.headers.host}/api/transport-activity/${result.transportActivity.id}`);
        return res.status(201).json({ message: "Created." });
      case 401:
        return res.status(401).json({ error: result.error });
      case 403:
        return res.status(403).json({ errors: result.errors });
      default:
        return res.status(500).send();
    }
  });
  app.get("/api/transport-activity", transportActivityController.generateListHandler());
  app.get("/api/transport-activity/:id", transportActivityController.generateDetailsHandler());
  app.put("/api/transport-activity/:id", transportActivityController.generateUpdateHandler());
  app.delete("/api/transport-activity/:id", transportActivityController.generateDeleteHandler());

  app.listen(port, () => {
    console.log(`App listening at port ${port}`);
    console.log("Navigate to /docs to interact with API");
  });
}

main();
