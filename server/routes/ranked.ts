import express from "express";
import { authOnly, UserPayload, verify } from "./api/auth";
import { file, uid } from "@common/util";

export const rankedRouter = express.Router();

const userToRoom = new Map<string, string>();
const rooms = new Set<string>();

rankedRouter.get("/", authOnly, (_, res) => {
  res.render(file("pages/queue.ejs"));
});

rankedRouter.get("/room/:id", async (req, res) => {
  let username = "";
  verify(req.cookies.token ?? "", (err, payload) => {
    if (err) {
      res.status(404);
    } else {
      const user = payload as UserPayload;

      username = user.username;
    }
  });

  const roomId = req.params.id;

  if (!rooms.has(roomId)) {
    res.status(404);
    return;
  }

  if (userToRoom.get(username) !== roomId) {
    res.status(404);
    return;
  }

  res.render(file("pages/room.ejs"), { id: req.params.id });
});

rankedRouter.post("/room/new", (req, res) => {
  if (req.body.secret !== process.env.JWT_SECRET!) {
    res.status(403);
    return;
  }

  const roomId = uid();

  const users: string[] = req.body.users;

  users.forEach(user => userToRoom.set(user, roomId));
  rooms.add(roomId);
});
