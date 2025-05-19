import { make_pair, Pair, Queue } from "@util/structs";
import { WSHandler } from "./wshandler";
import { action, jsonParse, QueueAction } from "@util/common";
import { RankedHandler } from "./rankedhandler";
import { User } from "@server/schemas";
import { WebSocket } from "ws";

const log = WSHandler.log;

export class QueueHandler extends WSHandler {
  public queue: Queue<Pair<string, number>>; // username, rating
  private queuedUsers: Set<string>;
  private rankedHandler: RankedHandler;

  constructor(rankedHandler: RankedHandler) {
    super();
    this.queue = new Queue<Pair<string, number>>();
    this.queuedUsers = new Set<string>();
    this.rankedHandler = rankedHandler;
  }

  async process(ws: WebSocket, username: string, raw: any) {
    this.sockets.set(username, ws);

    log(`Message from ${username}: ${raw}`);

    const data = jsonParse(raw);

    if (!(data.action as QueueAction)) return;

    const action: QueueAction = data.action;

    switch (action) {
      case QueueAction.INIT: {
        this.init(ws, username);
        break;
      }
      case QueueAction.QUEUE: {
        this.enqueue(ws, username);
        break;
      }
    }
  }

  async init(ws: WebSocket, username: string) {
    this.sockets.set(username, ws);
  }

  async enqueue(_: WebSocket, username: string) {
    if (this.queuedUsers.has(username)) {
      log(`User ${username} tried to queue, but is already in a game`);
      return;
    }

    const rating = await this.getRating(username);

    this.queue.enqueue(make_pair(username, rating));

    log(`Enqueued ${username}`);

    this.queuedUsers.add(username);

    if (this.queue.size() >= 2) {
      const [gameId, game] = await this.rankedHandler.createGame(
        this.queue.dequeue(),
        this.queue.dequeue(),
      );

      log(`Created game ${gameId} with users ${game.players}`);

      log(this.sockets.keys());

      game.players.forEach(player => {
        this.queuedUsers.delete(player);
        this.sockets.get(player)!.send(action(QueueAction.REDIRECT, { gameId }));
        this.rankedHandler.users.set(player, gameId);
      });
    }

    this.sockets.forEach(socket => {
      socket.send(action(QueueAction.UPDATE, {}));
    });
  }

  private async getRating(player: string) {
    const user = await User.findOne({ username: player });

    if (!user) return -1;

    return user.rating!;
  }
}
