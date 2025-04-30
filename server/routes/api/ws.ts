import express from "express";
import { log, msg, uid } from "@common/util";
import { make_pair, Pair, Queue } from "@common/structs";
import { User } from "@server/schemas";
import expressWs from "express-ws";
import dotenv from "dotenv";
import { authOnly } from "./auth";
import { WebSocket } from "ws";
import { userToRoom, rooms } from "../ranked";
import { approx, compute } from "@common/compute";
import { Game, Rating } from "@server/game";

dotenv.config();

export const wsRouter = express.Router();

(expressWs as any)(wsRouter);

const queue = new Queue<Pair<string, number>>();
const sockets = new Map<string, WebSocket>();

wsRouter.get("/queue", authOnly, (_, res) => {
  const front50 = queue.slice(50);

  res.send(front50);
});

wsRouter.ws("/", (ws, req) => {
  const { user } = req;

  log("Websocket connected");

  if (!user) {
    log("Failed to authenticate websocket connection");
    ws.send(JSON.stringify(msg("Authentication failed")));
    ws.close();

    return;
  }

  sockets.set(user.username, ws);

  ws.on("message", async raw => {
    log(`Websocket message: ${raw.toString()}`);

    try {
      const data = JSON.parse(raw.toString());

      const action: string = data.action ?? "";
      const username: string = req.user ? req.user.username : "";

      const user = await User.findOne({ username });

      if (action === "queue") {
        if (user !== null && !userToRoom.get(username)) {
          log(`Enqueued ${username}`);
          queue.enqueue(make_pair(username, user.rating!));

          if (queue.size() >= 2) {
            const player1 = queue.dequeue();
            const player2 = queue.dequeue();

            const users = [player1.first, player2.first];

            const roomId = uid(4);

            users.forEach(user => userToRoom.set(user, roomId));
            rooms.set(roomId, new Game(users, make_pair(player1.second, player2.second)));
            rooms.get(roomId)!.getQuestion();

            log(`New room created with id ${roomId}`);
            log(`Users in room: ${users}`);

            users.forEach(user => {
              sockets.get(user)!.send(JSON.stringify({ action: "redirect", roomId }));
              userToRoom.set(user, roomId);
            });
          }
        }

        sockets.forEach(socket => socket.send(JSON.stringify({ action: "refresh" })));
      } else if (action === "submit") {
        const user = req.user!.username;

        const roomId = userToRoom.get(user);

        if (!roomId) return;
        const game = rooms.get(roomId)!;

        log(`Submission from ${user} in room ${roomId}: ${data.answer} (${compute(data.answer)})`);

        if (approx(compute(game.answer), compute(data.answer))) {
          if (user === game.players[0]) {
            rooms.get(roomId)!.score.first++;
            log(`correct ${game.players[0]}`);
          } else {
            rooms.get(roomId)!.score.second++;
            log(`correct ${game.players[1]}`);
          }

          if (game.winner() === -1) {
            game.round++;

            await game.getQuestion();

            game.players.forEach(player => {
              sockets.get(player)!.send(JSON.stringify({ action: "update", ...rooms.get(roomId) }));
            });

            return;
          }

          const winner = game.winner();
          const { ratings } = game;

          const abs_changes = make_pair(
            new Rating(ratings.first).win(ratings.second),
            new Rating(ratings.second).win(ratings.first),
          );

          const wuser = (await User.findOne({ username: game.players[winner] }))!;

          await User.updateOne(
            { username: game.players[winner] },
            { rating: wuser.rating! + (winner === 0 ? abs_changes.first : abs_changes.second) },
          );

          const luser = (await User.findOne({ username: game.players[1 - winner] }))!;

          await User.updateOne(
            { username: game.players[1 - winner] },
            { rating: luser.rating! - (winner === 0 ? abs_changes.first : abs_changes.second) },
          );

          game.players.forEach(player => {
            sockets.get(player)!.send(JSON.stringify({ action: "update", ...rooms.get(roomId) }));
          });

          rooms.delete(roomId);
          game.players.forEach(p => userToRoom.delete(p));

          log(`Room ${roomId} is over`);
        }
      } else if (action === "fetch") {
        const user = req.user!.username;

        const roomId = userToRoom.get(user);

        if (!roomId) return;
        const game = rooms.get(roomId);

        ws.send(JSON.stringify({ action: "update", ...game }));
      } else if (action === "getinfo") {
        let ratingChanges: Pair<number, number> = make_pair(0, 0);

        const user = req.user!.username;

        const roomId = userToRoom.get(user);

        if (!roomId) {
          ws.send(JSON.stringify({ action: "info", username: user }));
          return;
        }
        const game = rooms.get(roomId)!;

        const { ratings } = game;

        if (user === game.players[0]) {
          const rating = new Rating(ratings.first);

          ratingChanges = make_pair(rating.win(ratings.second), rating.lose(ratings.second));
        } else {
          const rating = new Rating(ratings.second);

          ratingChanges = make_pair(rating.win(ratings.first), rating.lose(ratings.first));
        }

        ws.send(JSON.stringify({ action: "info", username: user, ratingChanges }));
      }
    } catch {}
  });
});
