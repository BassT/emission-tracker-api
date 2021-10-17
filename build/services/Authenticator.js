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
exports.ErrorCode = exports.NaiveAuthenticator = void 0;
class NaiveAuthenticator {
    authenticateRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.headers["x-naive-auth"]) {
                if (typeof req.headers["x-naive-auth"] === "string") {
                    return { userId: req.headers["x-naive-auth"] };
                }
                return { error: ErrorCode.AUTH_HEADER_INVALID_FORMAT };
            }
            return { error: ErrorCode.AUTH_HEADER_MISSING_OR_EMPTY };
        });
    }
}
exports.NaiveAuthenticator = NaiveAuthenticator;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AUTH_HEADER_MISSING_OR_EMPTY"] = "AUTH_HEADER_MISSING_OR_EMPTY";
    ErrorCode["AUTH_HEADER_INVALID_FORMAT"] = "AUTH_HEADER_INVALID_FORMAT";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
