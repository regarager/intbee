import { make_pair, Pair } from "@common/structs";
import { cdf } from "./statistics";
import { Problem } from "./schemas";
import { log } from "console";

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
  public players: string[];
  public score: Pair<number, number>;
  private used: string[];
  public round: number;
  public problem: string;
  public answer: string;

  constructor(players: string[]) {
    this.players = players;
    this.score = make_pair(0, 0);
    this.used = [];
    this.round = 1;
    this.problem = "";
    this.answer = "";
  }

  async getQuestion() {
    const res = (
      await Problem.find()
        .skip(Math.floor(Math.random() * 10))
        .limit(1)
        .sort({ rating: -1, _id: 1 })
    )[0];

    log(res);

    this.used.push(res.id);

    this.problem = res.latex!;
    this.answer = res.answer!;

    return res;
  }
}
