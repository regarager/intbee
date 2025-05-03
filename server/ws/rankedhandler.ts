import { Game } from "@server/game";
import { Pair } from "@util/structs";
import { action, RankedAction, jsonParse } from "@util/common";
import { User } from "@server/schemas";
import { approx, compute, uid } from "@util/server";
import { WSHandler } from "./wshandler";
import { WebSocket } from "ws";

const log = WSHandler.log;

export class RankedHandler extends WSHandler {
  public games: Map<string, Game>; // game id to game state
  public users: Map<string, string>; // username to game id

  constructor() {
    super();
    this.games = new Map<string, Game>();
    this.users = new Map<string, string>();
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
        this.update(ws, username, data.data, game, gameId);
        break;
      }
    }
  }

  async update(ws: WebSocket, username: string, data: any, game: Game, gameId: string) {
    ws.send(action(RankedAction.UPDATE, game.toPartial(username)));
  }

  async submit(ws: WebSocket, username: string, data: any, game: Game, gameId: string) {
    const answer = compute(data.answer);
    log(`Submission from ${username} in game ${gameId}: ${data.answer} (${answer})`);

    if (approx(compute(game.answer), answer)) {
      const player = game.players.indexOf(username);
      game.score[player]++;
      game.round++;

      log(`Correction submission from ${game.players[player]}`);

      const winner = game.winner();

      if (winner > -1) {
        log(`${game.players[winner]} won in game ${gameId}`);
        await this.updateRatings(game);
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

  async updateRatings(game: Game) {
    const winner = game.winner();

    if (winner < 0) return;

    const p1 = await User.findOne({ username: game.players[0] });

    if (p1 === null) {
      log("MAJOR ERROR", `player ${p1} not found`);
      return;
    }

    const p2 = await User.findOne({ username: game.players[1] });

    if (p2 === null) {
      log("MAJOR ERROR", `player ${p2} not found`);
      return;
    }

    if (winner === 0) {
      await p1.updateOne({ rating: p1.rating! + game.ratingChanges[0] });
      await p2.updateOne({ rating: p2.rating! - game.ratingChanges[1] });
    } else {
      await p1.updateOne({ rating: p1.rating! + game.ratingChanges[1] });
      await p2.updateOne({ rating: p2.rating! - game.ratingChanges[0] });
    }

    log(`Updated ratings for players ${game.players}`);
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
