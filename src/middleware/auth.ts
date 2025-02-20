import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_ACCESS_PASSWORD } from "../config/configJWT";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    if (!header) {
        res.status(403).json({ valid: false, message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(header as string, JWT_ACCESS_PASSWORD);
        if (typeof decoded !== "string") {
            req.userId = (decoded as JwtPayload).id;
            next();
        } else {
            res.status(403).json({ valid: false, message: "Invalid token format" });
        }
    } catch (err) {
        if (err  instanceof Error) {
            res.status(401).json({ valid: false, message: "Access token expired" });
        } else {
            res.status(403).json({ valid: false, message: "Token invalid" });
        }
    }
}