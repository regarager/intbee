import { log } from "@util/common";
import { NextFunction } from "express";

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
};
