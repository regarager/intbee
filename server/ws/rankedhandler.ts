import { Game } from "@server/game";
import { Pair } from "@util/structs";
import { action, RankedAction, jsonParse } from "@util/common";
import { compute, uid } from "@util/server";
import { WSHandler } from "./wshandler";
import { WebSocket } from "ws";
import { DateTime } from "luxon";

const log = WSHandler.log;

export class RankedHandler extends WSHandler {
  public games: Map<string, Game>; // game id to game state
  public users: Map<string, string>; // username to game id
  private timers: Map<string, NodeJS.Timeout>;

  constructor() {
    super();
    this.games = new Map<string, Game>();
    this.users = new Map<string, string>();
    this.timers = new Map<string, NodeJS.Timeout>();
  }

  async process(ws: WebSocket, username: string, raw: any) {
    this.sockets.set(username, ws);

    log(`Message from ${username}: ${raw}`);

    const data = jsonParse(raw);
    const gameId = this.users.get(username) ?? "";
    const game = this.games.get(gameId);

    if (!game) return;
    if (!(data.action as RankedAction)) return;

    const action: RankedAction = data.action;

    switch (action) {
      case RankedAction.SUBMIT: {
        this.submit(ws, username, data.data, game, gameId);
        break;
      }

      case RankedAction.UPDATE: {
        this.update(ws, username, game);
        break;
      }
    }
  }

  async update(ws: WebSocket, username: string, game: Game) {
    ws.send(action(RankedAction.UPDATE, game.toPartial(username)));
  }

  async submit(ws: WebSocket, username: string, data: any, game: Game, gameId: string) {
    if (DateTime.now().toMillis() > game.roundEndTime) {
      log(`Submission from ${username} after time expired`);
      return;
    }

    const answer = compute(data.answer);
    log(`Submission from ${username} in game ${gameId}: ${data.answer} (${answer})`);

    // if (approx(compute(game.answer), answer)) {
    if (true) {
      const player = game.players.indexOf(username);
      game.score[player]++;

      if (this.round < 5) {
        game.round++;
      }

      log(`Correction submission from ${game.players[player]}`);

      const winner = game.winner();

      if (winner > -2) {
        log(
          `Game ${gameId} completed, result: ${winner === -1 ? "tie" : `${game.players[winner]}`} won`,
        );
        await game.applyRatingChanges();
      } else {
        await game.getProblem();
      }

      game.players.forEach(player =>
        this.sockets.get(player)!.send(action(RankedAction.UPDATE, game.toPartial(player))),
      );
    }
  }

  async createGame(
    player1: Pair<string, number>,
    player2: Pair<string, number>,
  ): Promise<[string, Game]> {
    const users = [player1.first, player2.first];

    const gameId = uid(4);

    this.games.set(gameId, new Game(users, [player1.second, player2.second]));
    await this.games.get(gameId)!.getProblem();

    return [gameId, this.games.get(gameId)!];
  }

  cleanRoom(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) return;

    game.players.forEach(player => {
      this.users.delete(player);
    });

    this.games.delete(gameId);
  }
}
