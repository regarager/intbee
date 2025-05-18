import { log } from "@util/common";
import { NextFunction, Request, Response } from "express";

export const loggingMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
};
