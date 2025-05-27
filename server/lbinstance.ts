import { WebSocket } from "ws";

import { LBPartial, LBParticipant } from "@util/common";

// instance of lb tool
export class LBInstance {
  connections: Set<WebSocket>;
  admins: string[];
  score_values: number[];
  participants: LBParticipant[];
  size: number;

  // size is how many questions
  constructor(size: number, score_values: number[], admins: string[]) {
    this.connections = new Set<WebSocket>();
    this.admins = admins;
    this.score_values = score_values;
    this.participants = [];
    this.size = size;
  }

  // update state when answer is correct
  correct(participantId: number, question: number) {
    const part = this.participants[participantId];

    if (!part) return;

    part.attempts[question] = Math.abs(part.attempts[question]) + 1;
  }

  // update state when answer is incorrect
  incorrect(participantId: number, question: number) {
    const part = this.participants[participantId];

    if (!part) return;

    part.attempts[question] = -Math.abs(part.attempts[question]) - 1;
  }

  // undo last operation for a question for a participant
  undo(participantId: number, question: number) {
    const part = this.participants[participantId];

    if (!part) return;

    if (part.attempts[question] !== 0) {
      part.attempts[question] =
        Math.sign(part.attempts[question]) * (Math.abs(part.attempts[question]) - 1);
    }
  }

  // adds a participant
  add(name: string) {
    this.participants.push({
      pid: this.participants.length,
      name: name,
      attempts: new Array(this.size).fill(0),
    });
  }

  // removes a participant
  remove(name: string) {
    this.participants = this.participants.filter(p => p.name !== name);
  }

  // checks if username is marked as admin in the instance
  isAdmin(username: string) {
    return this.admins.includes(username);
  }

  toPartial(): LBPartial {
    return { score_values: this.score_values, participants: this.participants, size: this.size };
  }
}
