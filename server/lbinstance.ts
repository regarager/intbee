import { LBParticipant } from "@util/common";

// instance of lb tool
export class LBInstance {
  admins: string[];
  score_values: number[];
  participants: LBParticipant[];
  size: number;

  // size is how many questions
  constructor(size: number) {
    this.admins = [];
    this.score_values = Array(size).fill(0);
    this.participants = [];
    this.size = size;
  }
}
