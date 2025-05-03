import { log as slog } from "@util/common";
import { WebSocket } from "ws";

export abstract class WSHandler {
  protected sockets: Map<string, WebSocket>;
  constructor() {
    this.sockets = new Map<string, WebSocket>();
  }

  static log(...data: any[]) {
    slog("[WS]", ...data);
  }
}
