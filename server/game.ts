import { make_pair, Pair } from "@common/structs";
import { cdf } from "./normalcdf";

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

    return (1 - p) * Rating.POINT_TOTAL;
  }

  lose(other: number) {
    return Rating.POINT_TOTAL - this.win(other);
  }
}

export class Game {
  private players: string[];
  private score: Pair<number, number>;

  constructor(players: string[]) {
    this.players = players;
    this.score = make_pair(0, 0);
  }
}
