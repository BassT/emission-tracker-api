import "dotenv/config";
import arg from "arg";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import { BearerStrategy as AzureADBearerStrategy } from "passport-azure-ad";
import swaggerUi from "swagger-ui-express";
import { TransportActivityController } from "./controllers/TransportActivityController";
import { MongoDBTransportActivityMapper } from "./mappers/TransportActivityMapper";
import swaggerDoc from "./openapi.json";
import { JSONValidator } from "./services/JSONValidator";

const args = arg({
  "--unsafe-naive-auth": Boolean,
});

async function main() {
  const transportActivityMapper = await MongoDBTransportActivityMapper.getInstance();
  const jsonValidator = new JSONValidator();
  const transportActivityController = new TransportActivityController({
    jsonValidator,
    transportActivityMapper,
  });

  const port = process.env.PORT || 3000;
  const app = express();

  app.use(express.json());
  app.use(morgan("dev"));

  // Authentication
  if (args["--unsafe-naive-auth"]) {
    app.use("/api*", (req, res, next) => {
      if (req.headers["x-naive-auth"]) {
        if (typeof req.headers["x-naive-auth"] === "string") {
          req.user = { id: req.headers["x-naive-auth"] };
          return next();
        }
      }
      res.status(401).send("Unauthorized");
    });
    console.log("Using authentication: naive (UNSAFE!)");
  } else {
    if (!process.env.AZURE_AD_CLIENT_ID) {
      throw new Error("Missing environment variable: AZURE_AD_CLIENT_ID");
    }
    if (!process.env.AZURE_AD_IDENTITY_METADATA) {
      throw new Error("Missing environment variable: AZURE_AD_IDENTITY_METADATA");
    }
    if (!process.env.AZURE_AD_AUDIENCE) {
      throw new Error("Missing environment variable: AZURE_AD_AUDIENCE");
    }
    if (!process.env.AZURE_AD_ISSUER) {
      throw new Error("Missing environment variable: AZURE_AD_ISSUER");
    }
    if (!process.env.AZURE_AD_POLICY_NAME) {
      throw new Error("Missing environment variable: AZURE_AD_POLICY_NAME");
    }

    app.use(passport.initialize());
    passport.use(
      new AzureADBearerStrategy(
        {
          clientID: process.env.AZURE_AD_CLIENT_ID,
          identityMetadata: process.env.AZURE_AD_IDENTITY_METADATA,
          audience: process.env.AZURE_AD_AUDIENCE,
          issuer: process.env.AZURE_AD_ISSUER,
          policyName: process.env.AZURE_AD_POLICY_NAME,
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
    app.use("/api*", passport.authenticate("oauth-bearer", { session: false }));
    console.log("Using authentication: Azure AD");
  }

  app.get("/", (req, res) => {
    const { name = "World" } = req.query;
    res.send(`Hello ${name}!`);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.post("/api/transport-activity", async (req, res) => {
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

  app.get("/api/transport-activity", async (req, res) => {
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

  app.get("/api/transport-activity/:id", async (req, res) => {
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
  });

  app.put("/api/transport-activity/:id", async (req, res) => {
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
  });

  app.delete("/api/transport-activity/:id", async (req, res) => {
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
  });

  app.post("/api/transport-activity/import", async (req, res) => {
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
  });

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
