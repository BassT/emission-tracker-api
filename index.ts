import "dotenv/config";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import { BearerStrategy as AzureADBearerStrategy } from "passport-azure-ad";
import swaggerUi from "swagger-ui-express";
import { TransportActivityController } from "./controllers/TransportActivityController";
import { CosmosDBTransportActivityMapper } from "./mappers/TransportActivityMapper";
import swaggerDoc from "./openapi.json";
import { JSONValidator } from "./services/JSONValidator";

async function main() {
  const transportActivityMapper = await CosmosDBTransportActivityMapper.getInstance();
  const jsonValidator = new JSONValidator();
  const transportActivityController = new TransportActivityController({
    jsonValidator,
    transportActivityMapper,
  });

  const port = process.env.PORT || 3000;
  const app = express();

  app.use(express.json());
  app.use(morgan("dev"));
  app.use(passport.initialize());

  passport.use(
    new AzureADBearerStrategy(
      {
        clientID: "4e265e07-7236-4497-8f6d-313c53607b3b",
        identityMetadata: `https://emissiontracker.b2clogin.com/emissiontracker.onmicrosoft.com/B2C_1_emission-tracker-app/v2.0/.well-known/openid-configuration`,
        audience: "4e265e07-7236-4497-8f6d-313c53607b3b",
        issuer: "https://emissiontracker.b2clogin.com/e8ad1712-1cdf-4ef0-aa12-6fdf1519db81/v2.0/",
        policyName: "B2C_1_emission-tracker-app",
        isB2C: true,
        // Access token is valid, if any of the following scopes is present in token
        scope: ["user"],
        validateIssuer: true,
        loggingLevel: "error",
      },
      (token, done) => {
        const user = { id: token.oid };
        done(null, user, token);
      }
    )
  );

  // enable CORS (for testing only - remove in production/deployment)
  // app.use((_req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  //   next();
  // });

  app.get("/", (req, res) => {
    const { name = "World" } = req.query;
    res.send(`Hello ${name}!`);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.post("/api/transport-activity", passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    const result = await transportActivityController.create({
      userId: req.user?.id,
      params: req.body,
    });
    switch (result.status) {
      case 201:
        res.setHeader("location", `http://${req.headers.host}/api/transport-activity/${result.transportActivity.id}`);
        return res.status(201).json({ message: "Created." });
      case 400:
        return res.status(400).json({ errors: result.errors });
      case 401:
        return res.status(401).json({ error: result.error });
      default:
        return res.status(500).send();
    }
  });

  app.get("/api/transport-activity", passport.authenticate("oauth-bearer", { session: false }), async (req, res) => {
    const result = await transportActivityController.list({
      userId: req.user?.id,
      params: { ...req.params, ...req.query },
    });
    switch (result.status) {
      case 200:
        return res.status(200).json(result.items);
      case 400:
        return res.status(400).json({ errors: result.errors });
      case 401:
        return res.status(401).json({ error: result.error });
      default:
        return res.status(500).send();
    }
  });

  app.get(
    "/api/transport-activity/:id",
    passport.authenticate("oauth-bearer", { session: false }),
    async (req, res) => {
      const result = await transportActivityController.details({
        userId: req.user?.id,
        params: req.params,
      });
      switch (result.status) {
        case 200:
          return res.status(200).json(result.transportActivity);
        case 400:
          return res.status(400).json({ errors: result.errors });
        case 401:
          return res.status(401).json({ error: result.error });
        case 403:
          return res.status(403).json({ error: result.error });
        case 404:
          return res.status(404).json({ error: result.error });
        default:
          return res.status(500).send();
      }
    }
  );

  app.put(
    "/api/transport-activity/:id",
    passport.authenticate("oauth-bearer", { session: false }),
    async (req, res) => {
      const result = await transportActivityController.update({
        userId: req.user?.id,
        params: { ...req.params, ...req.body },
      });
      switch (result.status) {
        case 200:
          return res.status(200).json(result.transportActivity);
        case 400:
          return res.status(400).json({ errors: result.errors });
        case 401:
          return res.status(401).json({ error: result.error });
        case 403:
          return res.status(403).json({ error: result.error });
        case 404:
          return res.status(404).json({ error: result.error });
        default:
          return res.status(500).send();
      }
    }
  );

  app.delete(
    "/api/transport-activity/:id",
    passport.authenticate("oauth-bearer", { session: false }),
    async (req, res) => {
      const result = await transportActivityController.delete({
        userId: req.user?.id,
        params: req.params,
      });
      switch (result.status) {
        case 204:
          return res.status(204).send();
        case 400:
          return res.status(400).json({ errors: result.errors });
        case 401:
          return res.status(401).json({ error: result.error });
        case 403:
          return res.status(403).json({ error: result.error });
        case 404:
          return res.status(404).json({ error: result.error });
        default:
          return res.status(500).send();
      }
    }
  );

  app.post(
    "/api/transport-activity/import",
    passport.authenticate("oauth-bearer", { session: false }),
    async (req, res) => {
      const result = await transportActivityController.import({ userId: req.user?.id, params: { ...req.body } });
      switch (result.status) {
        case 200:
          return res.status(200).send(result.message);
        case 400:
          return res.status(400).json({ errors: result.errors });
        case 401:
          return res.status(401).send();
        default:
          return res.status(500).send();
      }
    }
  );

  app.listen(port, () => {
    console.log(`App listening at port ${port}`);
    console.log("Navigate to /docs to interact with API");
  });
}

declare global {
  namespace Express {
    interface User {
      id?: string;
    }
  }
}

main();
