import { jsonParse, LBPartial } from "@util/common";
import { WSHandler } from "./wshandler";
import { WebSocket } from "ws";
import { LBInstance } from "@server/lbinstance";

export class LBHandler extends WSHandler {
  instance;

  constructor(size: number) {
    super();
    this.instance = new LBInstance(size);
  }

  async process(ws: WebSocket, username: string, raw: any) {
    // if (!this.isAdmin(username)) return;

    this.sockets.set(username, ws);

    const data = jsonParse(raw);

    const action = data.action;

    switch (action) {
      case "correct": {
        const { participant, question } = data;
        const part = this.instance.participants.find(p => p === participant);

        if (!part) return;

        part.attempts[question] = Math.abs(part.attempts[question]) + 1;
        break;
      }

      case "incorrect": {
        const { participant, question } = data;
        const part = this.instance.participants.find(p => p === participant);

        if (!part) return;

        part.attempts[question] = -Math.abs(part.attempts[question]) - 1;
        break;
      }
    }
  }

  isAdmin(username: string) {
    return this.instance.admins.includes(username);
  }

  toPartial(): LBPartial {
    return { score_values: this.instance.score_values, participants: this.instance.participants };
  }
}
