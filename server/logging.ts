import { NextFunction, Request, Response } from "express";

import { log } from "@util/common";

// logs all requests
export const loggingMiddleware = async (req: Request, _: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`);
  next();
};
