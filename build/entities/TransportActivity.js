"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportActivity = void 0;
class TransportActivity {
    constructor({ id, title, date, distance, specificEmissions, totalEmissions, createdBy, createdAt, updatedAt, }) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.distance = distance;
        this.specificEmissions = specificEmissions;
        this.totalEmissions = totalEmissions;
        this.createdBy = createdBy;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt;
    }
}
exports.TransportActivity = TransportActivity;
