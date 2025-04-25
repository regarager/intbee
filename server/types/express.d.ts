import { UserPayload } from "@common/util";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
