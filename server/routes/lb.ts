import express from "express";
import expressWs from "express-ws";

import { LBHandler } from "@server/ws/lbhandler";
import { jsonParse } from "@util/common";
import { file } from "@util/server";

import { authOnly } from "./api/auth";

export const lbRouter = express.Router();

(expressWs as any)(lbRouter);

lbRouter.use(authOnly);

const handler = new LBHandler();

lbRouter.get("/", (_, res) => {
  res.send("HI");
});

// WARN: do not move this below the /:id route, otherwise WS breaks
lbRouter.ws("/", (ws, req) => {
  ws.on("message", async message => {
    const data = jsonParse(message.toString());

    await handler.process(ws, req.user!.username, data);
  });
});

// client-facing page, does not show any admin tools
lbRouter.get("/:id", (req, res) => {
  const id = req.params.id;
  if (!handler.instances.has(id)) {
    res.redirect("/error");
    return;
  }
  const instance = handler.instances.get(id)!;
  res.render(file("pages/lb.ejs"), { id: id, instance });
});

// admin-facing page, has admin options to edit user info
lbRouter.get("/:id/admin", (req, res) => {
  const id = req.params.id;
  const instance = handler.instances.get(id);
  if (!instance || !instance.admins.includes(req.user!.username)) {
    res.redirect("/error");
    return;
  }
  res.render(file("pages/adminlb.ejs"), { id: id, instance });
});
