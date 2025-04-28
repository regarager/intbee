import express from "express";
import { authOnly } from "./api/auth";
import { file, log, uid } from "@common/util";
import { Game } from "../game";
import { User } from "@server/schemas";

export const rankedRouter = express.Router();

export const userToRoom = new Map<string, string>();
export const rooms = new Map<string, Game>();

rankedRouter.get("/", authOnly, (_, res) => {
  res.render(file("pages/queue.ejs"));
});

rankedRouter.get("/room/:id", authOnly, async (req, res) => {
  const { user } = req;

  const roomId = req.params.id;

  if (!user) {
    res.status(403).redirect("/auth/login");
    return;
  }

  if (!rooms.has(roomId)) {
    res.status(404).redirect("/404");
    return;
  }

  if (userToRoom.get(user.username) !== roomId) {
    res.status(404).redirect("/gym");
    return;
  }

  const game = rooms.get(roomId)!;
  res.render(file("pages/room.ejs"), {
    id: roomId,
    player: await User.findOne({ username: user.username }),
    opponent: await User.findOne({
      username: game.players[game.players[0] === user.username ? 1 : 0],
    }),
    game,
  });
});

rankedRouter.post("/room/new", (req, res) => {
  if (req.body.secret !== process.env.JWT_SECRET!) {
    res.status(403);
    return;
  }

  const roomId = uid(4);

  const users: string[] = req.body.users;

  users.forEach(user => userToRoom.set(user, roomId));
  rooms.set(roomId, new Game(users));

  log(`New room created with id ${roomId}`);
  log(`Users in room: ${users}`);

  res.send("OK");
});
