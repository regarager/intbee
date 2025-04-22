import express from "express";
import { log, make_pair, Pair, Queue, User } from "../../util";
import expressWs from "express-ws";
import dotenv from "dotenv";
import { authOnly, UserPayload, verify } from "./auth";
import { randomBytes } from "crypto";

dotenv.config();

interface UserState {
  username: string;
  queued: boolean;
}

export const wsRouter = express.Router();

(expressWs as any)(wsRouter);

const queue = new Queue<Pair<string, number>>();
const userMap = new Map<string, UserState>(); // uuid to username
const ID_SIZE = 16;

const msg = (message: string) => {
  return { message };
};

wsRouter.get("/queue", authOnly, (_, res) => {
  const front50 = queue.slice(50);

  res.send(front50);
});

wsRouter.ws("/", (ws, req) => {
  const token = req.cookies.token ?? "";

  log("Websocket connected");

  verify(token, (err, user: UserPayload) => {
    if (err !== null) {
      log("Failed to authenticate websocket connection");
      ws.send(JSON.stringify(msg("Authentication failed")));
      ws.close();

      return;
    }

    let id = randomBytes(ID_SIZE).toString("hex");

    while (userMap.has(id)) {
      id = randomBytes(ID_SIZE).toString("hex");
    }

    log(`Websocket: assigning id ${id} to ${user.username}`);

    userMap.set(id, { username: user.username, queued: false });
    ws.send(JSON.stringify({ ...msg("Connected"), id, username: user.username }));
  });

  ws.on("message", async raw => {
    log(`Websocket message: ${raw.toString()}`);

    try {
      const data = JSON.parse(raw.toString());

      const action: string = data.action ?? "";
      const username: string = data.username ?? "";

      const user = await User.findOne({ username });

      if (action === "queue") {
        if (user && !userMap.get(username)?.queued) {
          userMap.set(username, { ...userMap.get(username), queued: true });
          queue.enqueue(make_pair(username, user.rating));
        }
      }
    } catch {}
  });
});
