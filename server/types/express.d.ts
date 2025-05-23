import { UserPayload } from "@util/server";

// adds user auth object to express request
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
