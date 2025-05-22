import { LBPartial, LBParticipant } from "@util/common";
import { WSHandler } from "./wshandler";
import { WebSocket } from "ws";
import { LBInstance } from "@server/lbinstance";

const log = WSHandler.log;

export class LBHandler extends WSHandler {
  instance;

  constructor(size: number) {
    super();
    this.instance = new LBInstance(size);
  }

  async process(ws: WebSocket, data: any) {
    const action = data.action;

    switch (action) {
      case "data": {
        this.sendData(ws);
        break;
      }
      case "correct": {
        this.correct(data);
        break;
      }

      case "incorrect": {
        this.incorrect(data);
        break;
      }

      case "undo": {
        this.undo(data);
        break;
      }

      case "user-add": {
        this.userAdd(data);
        break;
      }

      case "user-remove": {
        this.userRemove(data);
        break;
      }
    }
  }

  sendData(ws: WebSocket) {
    ws.send(JSON.stringify(this.toPartial()));
  }

  correct(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    part.attempts[question] = Math.abs(part.attempts[question]) + 1;
  }

  incorrect(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    part.attempts[question] = -Math.abs(part.attempts[question]) - 1;
  }

  undo(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    if (part.attempts[question] !== 0) {
      part.attempts[question] =
        Math.sign(part.attempts[question]) * (Math.abs(part.attempts[question]) - 1);
    }
  }

  userAdd(data: any) {
    const participant: LBParticipant = {
      id: this.instance.participants.length,
      name: data.name,
      attempts: new Array(this.instance.size).fill(0),
    };
    this.instance.participants.push(participant);
  }

  userRemove(data: any) {
    this.instance.participants = this.instance.participants.filter(p => p.name !== data.name);
  }

  save() {
    log("unimplemented (save)");
  }

  load() {
    log("unimplemented (load)");
  }

  isAdmin(username: string) {
    return this.instance.admins.includes(username);
  }

  toPartial(): LBPartial {
    return { score_values: this.instance.score_values, participants: this.instance.participants };
  }
}
