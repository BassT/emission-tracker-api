import JSONValidator, { JSONSchemaType } from "ajv";
import addJSONSchemaStringFormats from "ajv-formats";
import express from "express";
import { v4 as generateUUID } from "uuid";
import { TransportActivity } from "./entities/TransportActivity";
import { InMemoryTransportActitiyMapper, TransportActivityMapper } from "./mappers/TransportActivityMapper";
import { Logger } from "./services/Logger";

const logger: Logger = { log: console.log };
const transportActivityMapper: TransportActivityMapper = new InMemoryTransportActitiyMapper({ logger });
const jsonValidator = new JSONValidator({ allErrors: true });
addJSONSchemaStringFormats(jsonValidator);

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  const { name = "World" } = req.query;
  res.send(`Hello ${name}!`);
});

interface PostTransportActivityBody {
  title: string;
  date: string;
  distance: number;
  specificEmissions: number;
  totalEmissions: number;
}

const postTransportActivityBodySchema: JSONSchemaType<PostTransportActivityBody> = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", format: "date-time" },
    distance: { type: "number" },
    specificEmissions: { type: "number" },
    totalEmissions: { type: "number" },
  },
  required: ["title", "date", "distance", "specificEmissions", "totalEmissions"],
};

app.post("/api/transport-activity", async (req, res) => {
  const validate = jsonValidator.compile(postTransportActivityBodySchema);
  if (validate(req.body)) {
    const transportActivity = new TransportActivity({ ...req.body, id: generateUUID(), date: new Date(req.body.date) });
    await transportActivityMapper.save({ transportActivity });
    res.setHeader("location", `http://${req.headers.host}/api/transport-activity/${transportActivity.id}`);
    return res.status(201).send("Created.");
  } else {
    return res.status(400).json(validate.errors);
  }
});

app.listen(port, () => console.log(`App listening at port ${port}`));
