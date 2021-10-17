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
exports.InMemoryTransportActitiyMapper = void 0;
class InMemoryTransportActitiyMapper {
    constructor({ logger }) {
        this.transportActivities = [];
        this.logger = logger;
    }
    get({ id }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.transportActivities.find((item) => item.id === id);
        });
    }
    list({ filter, select, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let activities = this.transportActivities;
            if (filter.createdBy) {
                activities = activities.filter((item) => item.createdBy === filter.createdBy);
            }
            const results = activities.map((item) => {
                let result = { id: item.id };
                if (select.title) {
                    result = Object.assign(Object.assign({}, result), { title: item.title });
                }
                return result;
            });
            return results;
        });
    }
    save({ transportActivity }) {
        return __awaiter(this, void 0, void 0, function* () {
            const idx = this.transportActivities.findIndex((item) => item.id === transportActivity.id);
            if (idx === -1) {
                this.transportActivities = [...this.transportActivities, transportActivity];
            }
            else {
                this.transportActivities = [
                    ...this.transportActivities.slice(0, idx),
                    transportActivity,
                    ...this.transportActivities.slice(idx + 1),
                ];
            }
            this.logger.log(`${InMemoryTransportActitiyMapper.name}: Saved ${JSON.stringify(transportActivity, null, 2)}`);
            return transportActivity;
        });
    }
}
exports.InMemoryTransportActitiyMapper = InMemoryTransportActitiyMapper;
