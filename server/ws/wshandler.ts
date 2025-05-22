import { WebSocket } from "ws";

import { log as slog } from "@util/common";

// base class for websocket handlers (see other files in this foldre)
export abstract class WSHandler {
  protected sockets: Map<string, WebSocket>;

  // initializes empty handler
  constructor() {
    this.sockets = new Map<string, WebSocket>();
  }

  // adds special prefix for logging for ws
  static log(...data: any[]) {
    slog("[WS]", ...data);
  }
}
