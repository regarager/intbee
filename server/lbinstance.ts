import { LBParticipant } from "@util/common";

export class LBInstance {
  admins: string[];
  score_values: number[];
  participants: LBParticipant[];

  constructor(size: number) {
    this.admins = [];
    this.score_values = Array(size).fill(0);
    this.participants = [];
  }
}
