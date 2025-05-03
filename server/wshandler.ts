import { WebSocket } from "ws";
import { Game } from "./game";
import { make_pair, Pair, Queue } from "@util/structs";
import { ActionType, jsonParse, log as slog } from "@util/common";
import { User } from "./schemas";
import { approx, compute, uid } from "@util/server";

const { stringify } = JSON;

function log(...data: any[]) {
  slog("WS: ", ...data);
}

function validAction(s: string) {
  return Object.values(ActionType).includes(s as ActionType);
}

export class WSHandler {
  private queue: Queue<Pair<string, number>>; // username, rating
  private rooms: Map<string, Game>; // room id to game state
  private sockets: Map<string, WebSocket>;
  private users: Map<string, string>; // username to room id

  constructor() {
    this.queue = new Queue<Pair<string, number>>();
    this.rooms = new Map<string, Game>();
    this.sockets = new Map<string, WebSocket>();
    this.users = new Map<string, string>();
  }

  async process(ws: WebSocket, username: string, raw: any) {
    this.sockets.set(username, ws);

    log(`Message from ${username}: ${raw}`);

    const data = jsonParse(raw);
    const roomId = this.users.get(username) ?? "";
    const game = this.rooms.get(roomId);

    if (!game) return;
    if (!validAction(data.action ?? "")) return;

    const action: ActionType = data.action;

    switch (action) {
      case ActionType.FETCH: {
        ws.send(stringify(game.toPartial()));
        break;
      }

      case ActionType.INFO: {
        const partial = game.toPartial();

        const response = {
          username: username,
          ratingChanges: partial.ratingChanges,
        };

        ws.send(stringify(response));
        break;
      }

      case ActionType.QUEUE: {
        if (this.users.has(username)) return;

        const rating = await this.getRating(username);

        this.queue.enqueue(make_pair(username, rating));

        log(`Enqueued ${username}`);

        if (this.queue.size() >= 2) {
          const player1 = this.queue.dequeue();
          const player2 = this.queue.dequeue();

          const users = [player1.first, player2.first];

          const roomId = uid(4);

          users.forEach(user => {
            this.sockets.get(user)!.send(JSON.stringify({ action: "redirect", roomId }));
            this.users.set(user, roomId);
          });
          this.rooms.set(roomId, new Game(users, [player1.second, player2.second]));
          this.rooms.get(roomId)!.getProblem();

          log(`New room created with id ${roomId}`);
          log(`Users in room: ${users}`);
        }

        break;
      }

      case ActionType.SUBMIT: {
        const answer = compute(data.answer);
        log(`Submission from ${username} in room ${roomId}: ${data.answer} (${answer})`);

        if (approx(compute(game.answer), answer)) {
          const player = game.players.indexOf(username);
          game.score[player]++;
          game.round++;

          log(`Correction submission from ${game.players[player]}`);

          await game.getProblem();

          game.players.forEach(player =>
            this.sockets
              .get(player)!
              .send(JSON.stringify({ action: ActionType.UPDATE, game: game.toPartial() })),
          );
        }
        break;
      }
    }
  }

  async enqueue(username: string) {
    const user = await User.findOne({ username });

    if (user === null) return false;

    this.queue.enqueue(make_pair(username, user.rating!));

    return true;
  }

  async createRoom(p1: string, p2: string) {
    if (!this.users.has(p1) || !this.users.has(p2)) {
      return false;
    }

    const roomId = uid(4);

    this.users.set(p1, roomId);
    this.users.set(p2, roomId);

    this.rooms.set(
      roomId,
      new Game([p1, p2], [await this.getRating(p1), await this.getRating(p2)]),
    );
  }

  async getRating(player: string) {
    const user = await User.findOne({ username: player });

    if (!user) return -1;

    return user.rating!;
  }
}
