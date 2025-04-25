import { make_pair, Pair } from "@common/structs";
import { cdf } from "./statistics";
import { Problem } from "./schemas";

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
  private players: string[];
  private score: Pair<number, number>;
  private used: string[];
  private round: number;

  constructor(players: string[]) {
    this.players = players;
    this.score = make_pair(0, 0);
    this.used = [];
    this.round = 1;
  }

  async getQuestion() {
    const problems = await Problem.aggregate([
      {
        $match: { _id: { $nin: this.used } },
      },
      {
        $sample: { size: 1 },
      },
    ]);

    const res = problems[0];

    this.used.push(res.id);

    return res;
  }
}
