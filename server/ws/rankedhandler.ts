import { DateTime } from "luxon";
import { WebSocket } from "ws";

import { Game } from "@server/game";
import { action, RankedAction, jsonParse, RANKED_TIMER, RANKED_MAX_ROUNDS } from "@util/common";
import { approx, compute, uid } from "@util/server";
import { Pair } from "@util/structs";

import { WSHandler } from "./wshandler";

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

  update(ws: WebSocket, username: string, game: Game) {
    ws.send(action(RankedAction.UPDATE, game.toPartial(username)));
  }

  async submit(_: WebSocket, username: string, data: any, game: Game, gameId: string) {
    if (DateTime.now().toMillis() > game.roundEndTime) {
      log(`Submission from ${username} after time expired`);
      return;
    }

    const answer = compute(data.answer);
    log(`Submission from ${username} in game ${gameId}: ${data.answer} (${answer})`);

    if (approx(compute(game.answer), answer)) {
      clearTimeout(this.timers.get(gameId));
      this.timers.delete(gameId);

      const player = game.players.indexOf(username);
      game.score[player]++;

      log(`Correction submission from ${game.players[player]}`);

      const winner = game.winner();

      if (winner > -2) {
        log(
          `Game ${gameId} completed, result: ${winner === -1 ? "tie" : `${game.players[winner]}`} won`,
        );
        await game.applyRatingChanges();
      } else {
        await this.nextProblem(gameId, game);
      }

      this.updatePlayers(this.games.get(gameId)!);
    }
  }

  async createGame(
    player1: Pair<string, number>,
    player2: Pair<string, number>,
  ): Promise<[string, Game]> {
    const users = [player1.first, player2.first];

    const gameId = uid(4);

    const game = new Game(users, [player1.second, player2.second]);

    this.games.set(gameId, game);

    // figure out a better way to let ws connect
    setTimeout(() => {
      this.nextProblem(gameId, game);
    }, 1000);

    return [gameId, game];
  }

  async nextProblem(gameId: string, game: Game) {
    if (game.round >= RANKED_MAX_ROUNDS) return;

    await game.getProblem();
    this.updatePlayers(game);
    this.timers.set(
      gameId,
      setTimeout(async () => {
        log(`Game ${gameId} timed out on round ${game.round}`);
        await this.nextProblem(gameId, game);
      }, RANKED_TIMER * 1000),
    );
  }

  cleanRoom(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) return;

    game.players.forEach(player => {
      this.users.delete(player);
    });

    this.games.delete(gameId);
  }

  updatePlayers(game: Game) {
    game.players.forEach(player => this.update(this.sockets.get(player)!, player, game));
  }
}
