"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const TransportActivityController_1 = require("./controllers/TransportActivityController");
const TransportActivityMapper_1 = require("./mappers/TransportActivityMapper");
const Authenticator_1 = require("./services/Authenticator");
const JSONValidator_1 = require("./services/JSONValidator");
const openapi_json_1 = __importDefault(require("./openapi.json"));
const logger = { log: console.log };
const authenticator = new Authenticator_1.NaiveAuthenticator();
const transportActivityMapper = new TransportActivityMapper_1.InMemoryTransportActitiyMapper({ logger });
const jsonValidator = new JSONValidator_1.JSONValidator();
const transportActivityController = new TransportActivityController_1.TransportActivityController({
    authenticator,
    jsonValidator,
    transportActivityMapper,
});
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    const { name = "World" } = req.query;
    res.send(`Hello ${name}!`);
});
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_json_1.default));
app.post("/api/transport-activity", transportActivityController.generateCreateHandler());
app.get("/api/transport-activity", transportActivityController.generateListHandler());
app.get("/api/transport-activity/:id", transportActivityController.generateDetailsHandler());
app.listen(port, () => console.log(`App listening at port ${port}`));
