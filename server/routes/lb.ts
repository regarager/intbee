import express from "express";
import WebSocket from "ws";
import { LBParticipant, log } from "@util/common";
import { readFileSync, writeFileSync } from "fs";
import { LBHandler } from "@server/ws/lbhandler";
import expressWs from "express-ws";
import { file } from "@util/server";

export const lbRouter = express.Router();

(expressWs as any)(lbRouter);

const handler = new LBHandler(17);
const n = 17;
const instances = new Set<WebSocket>();

function addUser(name: string) {
  const participant: LBParticipant = {
    id: handler.instance.participants.length,
    name: name,
    attempts: new Array(n).fill(0),
  };
  handler.instance.participants.push(participant);
}

lbRouter.get("/", (req, res) => {
  res.render(file("pages/lb.ejs"));
});

lbRouter.get("/admin", (req, res) => {
  res.render(file("pages/adminlb.ejs"));
});

const broadcast = (callback: (client: WebSocket) => any) =>
  instances.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      callback(client);
    }
  });

lbRouter.ws("/", ws => {
  instances.add(ws);
  log("Client connected");

  const update = () => broadcast(client => client.send(JSON.stringify(handler.toPartial())));

  ws.on("message", message => {
    const data = JSON.parse(message.toString());
    log(data);

    if (data.action === "data") {
    } else if (data.action === "admin-add") {
      addUser(data.name);
      log("added user");
    } else if (data.action === "admin-remove") {
      handler.instance.participants = handler.instance.participants.filter(
        p => p.id !== parseInt(data.id),
      );
      log("removed " + data.id);
    } else if (data.action === "admin-wrong") {
      const participant = handler.instance.participants.find(p => p.id === parseInt(data.id));
      if (participant) {
        handler.process(ws, data.username, {
          action: "incorrect",
          participant,
          question: data.question,
        });
      }
    } else if (data.action === "admin-correct") {
      const participant = handler.instance.participants.find(p => p.id === parseInt(data.id));
      if (participant) {
        handler.process(ws, data.username, {
          action: "correct",
          participant,
          question: data.question,
        });
      }
    } else if (data.action === "admin-undo") {
      const index = handler.instance.participants.findIndex(p => p.id === parseInt(data.id));
      if (index !== -1) {
        const attempts = handler.instance.participants[index].attempts[parseInt(data.question)];
        const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
        handler.instance.participants[index].attempts[parseInt(data.question)] -= sign(attempts);
        log(`Undid last change on user ${data.id} on question ${data.question}`);
      }
    } else if (data.action === "admin-save") {
      writeFileSync("data.json", JSON.stringify(handler.instance.participants));
      log("saved data");
    } else if (data.action === "admin-load") {
      const content = readFileSync("data.json", "utf-8");
      handler.instance.participants = JSON.parse(content) as LBParticipant[];
      log("loaded data");
    }

    update();
  });

  ws.on("close", () => {
    instances.delete(ws);
    log("Client disconnected");
  });
});
