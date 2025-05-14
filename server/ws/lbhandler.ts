import { jsonParse, LBPartial, LBParticipant } from "@util/common";
import { WSHandler } from "./wshandler";
import { WebSocket } from "ws";

function array<T>(size: number) {
  return new Array<T>(size);
}
export class LBHandler extends WSHandler {
  private admins: string[];
  private score_values: number[];
  private participants: LBParticipant[];

  constructor(size: number) {
    super();
    this.admins = [];
    this.score_values = array(size).map(_ => 0);
    this.participants = [];
  }

  async process(ws: WebSocket, username: string, raw: any) {
    if (!this.isAdmin(username)) return;

    this.sockets.set(username, ws);

    const data = jsonParse(raw);

    const action = data.action;

    switch (action) {
      case "correct": {
        const { participant, question } = data;
        const part = this.participants.find(p => p === participant);

        if (!part) return;

        part.attempts[question] = Math.abs(part.attempts[question]) + 1;
        break;
      }

      case "incorrect": {
        const { participant, question } = data;
        const part = this.participants.find(p => p === participant);

        if (!part) return;

        part.attempts[question] = -Math.abs(part.attempts[question]) - 1;
        break;

        break;
      }
    }
  }

  isAdmin(username: string) {
    return this.admins.includes(username);
  }

  toPartial(): LBPartial {
    return { score_values: this.score_values, participants: this.participants };
  }
}
