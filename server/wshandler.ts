import { log as slog } from "@util/common";

export abstract class WSHandler {
  constructor() {}

  static log(...data: any[]) {
    slog("[WS]", ...data);
  }
}
