"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportActivityController = void 0;
const TransportActivity_1 = require("../entities/TransportActivity");
const uuid_1 = require("uuid");
class TransportActivityController {
    constructor({ authenticator, jsonValidator, transportActivityMapper, }) {
        this.authenticator = authenticator;
        this.jsonValidator = jsonValidator;
        this.transportActivityMapper = transportActivityMapper;
    }
    generateCreateHandler() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, error } = yield this.authenticator.authenticateRequest(req);
            if (error || !userId)
                return res.status(401).send(error);
            if (this.jsonValidator.validate(createBodySchema, req.body)) {
                const transportActivity = new TransportActivity_1.TransportActivity(Object.assign(Object.assign({}, req.body), { id: (0, uuid_1.v4)(), date: new Date(req.body.date), createdBy: userId }));
                yield this.transportActivityMapper.save({ transportActivity });
                res.setHeader("location", `http://${req.headers.host}/api/transport-activity/${transportActivity.id}`);
                return res.status(201).send("Created.");
            }
            else {
                return res.status(400).json(this.jsonValidator.getErrors(createBodySchema, req.body));
            }
        });
    }
    generateDetailsHandler() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, error } = yield this.authenticator.authenticateRequest(req);
            if (error || !userId)
                return res.status(401).send(error);
            if (this.jsonValidator.validate(detailsBodySchema, req.params)) {
                const transportActivity = yield this.transportActivityMapper.get({ id: req.params.id });
                if (!transportActivity)
                    return res.status(404).send("Not found.");
                return res.status(200).json(transportActivity);
            }
            else {
                return res.status(400).json(this.jsonValidator.getErrors(createBodySchema, req.body));
            }
        });
    }
    generateListHandler() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, error } = yield this.authenticator.authenticateRequest(req);
            if (error || !userId)
                return res.status(401).send(error);
            if (this.jsonValidator.validate(listBodySchema, req.query)) {
                const result = yield this.transportActivityMapper.list({
                    filter: { createdBy: userId },
                    select: { title: req.query.title === "true" ? true : false },
                });
                return res.status(200).json(result);
            }
            else {
                return res.status(400).json(this.jsonValidator.getErrors(listBodySchema, req.body));
            }
        });
    }
}
exports.TransportActivityController = TransportActivityController;
const createBodySchema = {
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
const detailsBodySchema = {
    type: "object",
    properties: {
        id: { type: "string" },
    },
    required: ["id"],
};
const listBodySchema = {
    type: "object",
    properties: {
        title: { type: "string", nullable: true, enum: ["true"] },
    },
};
