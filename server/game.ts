import { cdf } from "./statistics";
import { Problem } from "./schemas";
import { GamePartial, RANKED_TIMER } from "@util/common";
import { DateTime } from "luxon";

export class Rating {
  private rating: number;
  public static RATING_STDEV = 200;
  public static DIFFERENCE_STDEV = Rating.RATING_STDEV * Math.SQRT2;
  public static POINT_TOTAL = 40;

  constructor(rating: number) {
    this.rating = rating;
  }

  z(other: number) {
    return (this.rating - other) / Rating.DIFFERENCE_STDEV;
  }

  win(other: number) {
    const z = this.z(other);
    const p = cdf(z);

    return Math.ceil((1 - p) * Rating.POINT_TOTAL);
  }

  lose(other: number) {
    return Rating.POINT_TOTAL - this.win(other);
  }
}

export class Game {
  answer: string;
  players: string[];
  problem: string;
  ratingChanges: number[];
  ratings: number[];
  round: number;
  score: number[];
  used: string[];
  roundEndTime: number;

  constructor(players: string[], ratings: number[]) {
    this.players = players;
    this.ratings = ratings;

    const ratingCalc = new Rating(ratings[0]);
    ratingCalc.win(ratings[1]);

    this.ratingChanges = [ratingCalc.win(ratings[1]), ratingCalc.lose(ratings[1])];

    this.score = [0, 0];
    this.used = [];
    this.round = 1;
    this.problem = "";
    this.answer = "";
    this.roundEndTime = DateTime.now().plus({ seconds: RANKED_TIMER }).toMillis();
  }

  startTimer() {
    this.roundEndTime = DateTime.now().plus({ minutes: 2 }).toMillis();
  }

  async getProblem() {
    const matches = await Problem.aggregate([
      { $match: { _id: { $nin: this.used } } },
      { $sample: { size: 1 } },
    ]);

    const problem = matches[0];

    if (!problem) return null;

    this.used.push(problem.id);

    this.problem = problem.latex!;
    this.answer = problem.answer!;

    this.startTimer();

    return problem[0];
  }

  winner() {
    if (this.score[0] >= 2) {
      return 0;
    } else if (this.score[1] >= 2) {
      return 1;
    }

    return -1;
  }

  toPartial(player: string): GamePartial {
    return {
      player: this.players.indexOf(player),
      players: this.players,
      ratings: this.ratings,
      ratingChanges: this.ratingChanges,
      score: this.score,
      round: this.round,
      problem: this.problem,
      winner: this.winner(),
      roundEndTime: this.roundEndTime,
    };
  }
}
