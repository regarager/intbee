import express from "express";
import expressWs from "express-ws";
import WebSocket from "ws";

import { LBHandler } from "@server/ws/lbhandler";
import { jsonParse, log } from "@util/common";
import { file } from "@util/server";

export const lbRouter = express.Router();

(expressWs as any)(lbRouter);

const n = 17;
const handler = new LBHandler(n);
const instances = new Set<WebSocket>();

// client-facing page, does not show any admin tools
lbRouter.get("/", (_, res) => {
  res.render(file("pages/lb.ejs"));
});

// admin-facing page, has admin options to edit user info
lbRouter.get("/admin", (_, res) => {
  res.render(file("pages/adminlb.ejs"));
});

lbRouter.ws("/", ws => {
  instances.add(ws);
  log("Client connected");

  // send state to all clients
  const update = () => {
    instances.forEach(client => client.send(JSON.stringify(handler.toPartial())));
  };

  ws.on("message", async message => {
    const data = jsonParse(message.toString());

    await handler.process(ws, data);

    update();
  });

  ws.on("close", () => {
    instances.delete(ws);
    log("Client disconnected");
  });
});
