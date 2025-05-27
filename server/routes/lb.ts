import { log } from "console";
import express from "express";
import expressWs from "express-ws";

import { LBTool } from "@server/schemas";
import { LBHandler } from "@server/ws/lbhandler";
import { jsonParse } from "@util/common";
import { file } from "@util/server";

import { authOnly } from "./api/auth";

export const lbRouter = express.Router();

(expressWs as any)(lbRouter);

lbRouter.use(authOnly);

const handler = new LBHandler();

function process(data: any) {
  const res: { size: number; score_values: number[]; admins: string[] } = {
    size: 0,
    score_values: [],
    admins: [],
  };

  if (parseInt(data.size)) {
    res.size = parseInt(data.size);
  } else {
    return null;
  }

  if (!data.score_values) return null;

  const score_values = data.score_values
    .replace(/\s/g, "")
    .split(",")
    .map((x: string) => parseInt(x)) as number[];

  if (score_values.some(Number.isNaN)) {
    return null;
  }

  res.score_values = score_values;

  if (res.score_values.length > res.size) {
    res.score_values = res.score_values.slice(0, res.size);
  } else if (res.score_values.length === 0) {
    res.score_values = Array(res.size).fill(1);
  }
  while (res.score_values.length < res.size) {
    res.score_values.push(res.score_values[res.score_values.length - 1]);
  }

  if (!data.admins) return null;
  const admins = data.admins.replace(/\s/g, "").split(",") as string[];

  res.admins = admins;

  return res;
}

lbRouter.get("/", (_, res) => {
  res.render(file("pages/lb.ejs"));
});

lbRouter.post("/new", async (req, res) => {
  const data = process(req.body);

  log(req.body);
  if (!data) {
    res.status(400);
    return;
  }

  data.admins = [...new Set(data.admins).add(req.user!.username)];

  const doc = new LBTool({
    score_values: data.score_values,
    participants: [],
    admins: data.admins,
    size: data.size,
  });

  const id = doc.id!;

  handler.createInstance({
    id,
    size: data.size,
    score_values: data.score_values,
    admins: data.admins,
  });

  await doc.save();

  res.set("HX-Redirect", `/lb/${id}/admin`).send("OK");
});

// WARN: do not move this below the /:id route, otherwise WS breaks
lbRouter.ws("/", (ws, req) => {
  ws.on("message", async message => {
    const data = jsonParse(message.toString());

    await handler.process(ws, req.user!.username, data);
  });
});

// client-facing page, does not show any admin tools
lbRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await LBTool.findById(id);

  if (doc && !handler.instances.has(id)) {
    await handler.loadFromDB(id);
  }

  if (!handler.instances.has(id)) {
    res.redirect("/error");
    return;
  }

  if (!handler.instances.has(id)) {
    await handler.loadFromDB(id);
  }

  const instance = handler.instances.get(id)!;
  res.render(file("pages/lbinstance.ejs"), { id: id, instance });
});

// admin-facing page, has admin options to edit user info
lbRouter.get("/:id/admin", async (req, res) => {
  const id = req.params.id;
  const doc = await LBTool.findById(id);

  if (doc && !handler.instances.has(id)) {
    await handler.loadFromDB(id);
  }

  const instance = handler.instances.get(id);

  if (!instance || !instance.admins.includes(req.user!.username)) {
    res.redirect("/error");
    return;
  }
  res.render(file("pages/lbadmin.ejs"), { id: id, instance });
});

// get download as JSON
lbRouter.get("/:id/download", (req, res) => {
  const id = req.params.id;
  const instance = handler.instances.get(id);

  if (!instance || !instance.admins.includes(req.user!.username)) {
    res.redirect("/error");
    return;
  }

  res.setHeader("Content-disposition", `attachment; filename=${id}.json`);
  res.setHeader("Content-type", "application/json");
  res.send(JSON.stringify(instance.toPartial()));
});

// save to database
lbRouter.post("/:id/admin/save", async (req, res) => {
  const id = req.params.id;
  const instance = handler.instances.get(id);
  const doc = await LBTool.findById(id);

  if (!instance || !instance.admins.includes(req.user!.username) || !doc) {
    res.status(400);
    return;
  }

  await doc.updateOne({
    participants: instance.participants.map(p => {
      return { ...p };
    }),
  });

  res.send(`<p style="color: green">Success!</p>`);
});
