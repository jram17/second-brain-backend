"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configJWT_1 = require("../config/configJWT");
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header) {
        res.status(403).json({ valid: false, message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(header, configJWT_1.JWT_ACCESS_PASSWORD);
        if (typeof decoded !== "string") {
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(403).json({ valid: false, message: "Invalid token format" });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(401).json({ valid: false, message: "Access token expired" });
        }
        else {
            res.status(403).json({ valid: false, message: "Token invalid" });
        }
    }
};
exports.userMiddleware = userMiddleware;
//# sourceMappingURL=auth.js.map