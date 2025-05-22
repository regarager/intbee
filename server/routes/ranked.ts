import { log } from "console";
import express from "express";
import expressWs from "express-ws";

import { User } from "@server/schemas";
import { QueueHandler } from "@server/ws/queuehandler";
import { RankedHandler } from "@server/ws/rankedhandler";
import { msg } from "@util/common";
import { file } from "@util/server";

import { authOnly } from "./api/auth";

export const rankedRouter = express.Router();

(expressWs as any)(rankedRouter);

rankedRouter.use("/", authOnly);

const rankedHandler = new RankedHandler();
const queueHandler = new QueueHandler(rankedHandler);

rankedRouter.get("/", (_, res) => {
  res.render(file("pages/queue.ejs"));
});

rankedRouter.get("/room/:id", async (req, res) => {
  const { user } = req;

  const gameId = req.params.id;

  if (!user) {
    res.status(403).redirect("/auth/login");
    return;
  }

  if (!rankedHandler.games.has(gameId)) {
    res.status(404).redirect("/404");
    return;
  }

  if (rankedHandler.users.get(user.username) !== gameId) {
    res.status(404).redirect("/gym");
    return;
  }

  const game = rankedHandler.games.get(gameId)!;
  res.render(file("pages/room.ejs"), {
    id: gameId,
    player: await User.findOne({ username: user.username }),
    opponent: await User.findOne({
      username: game.players[game.players[0] === user.username ? 1 : 0],
    }),
    game,
  });
});

rankedRouter.get("/queue", (_, res) => {
  const front50 = queueHandler.queue.slice(50);

  res.send(front50);
});

rankedRouter.ws("/ws/game", (ws, req) => {
  const { user } = req;

  if (!user) {
    log("Failed to authenticate websocket connection");
    ws.send(JSON.stringify(msg("Failed authentication")));
    ws.close();
    return;
  }

  ws.on("message", async raw => {
    rankedHandler.process(ws, user.username, raw);
  });
});

rankedRouter.ws("/ws/queue", (ws, req) => {
  const { user } = req;

  if (!user) {
    log("Failed to authenticate websocket connection");
    ws.send(JSON.stringify(msg("Failed authentication")));
    ws.close();
    return;
  }

  ws.on("message", async raw => {
    queueHandler.process(ws, user.username, raw);
  });
});
