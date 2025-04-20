import ws, { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { log } from "../../util";

const broadcast = (wss: WebSocketServer, callback: (client: WebSocket) => any) => {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      callback(client);
    }
  });
};

export function createWS(server: http.Server) {
  return new ws.WebSocketServer({ server, path: "/api/ws/" });
}

export function initWS(wss: ws.WebSocketServer) {
  wss.on("connection", ws => {
    log("Client connected");

    ws.on("message", message => {
      const data = JSON.parse(message + "");

      log(data);
    });

    ws.on("close", () => {
      log("Client disconnected");
    });
  });
}
