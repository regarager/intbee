import { WebSocket } from "ws";

import { LBInstance } from "@server/lbinstance";
import { LBPartial, LBParticipant } from "@util/common";

import { WSHandler } from "./wshandler";

const log = WSHandler.log;

// ws handler for leaderboard tool
export class LBHandler extends WSHandler {
  instance;

  // creates new handler
  constructor(size: number) {
    super();
    this.instance = new LBInstance(size);
  }

  // processes ws requests
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

  // send state to client
  sendData(ws: WebSocket) {
    ws.send(JSON.stringify(this.toPartial()));
  }

  // update state when answer is correct
  correct(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    part.attempts[question] = Math.abs(part.attempts[question]) + 1;
  }

  // update state when answer is incorrect
  incorrect(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    part.attempts[question] = -Math.abs(part.attempts[question]) - 1;
  }

  // undo last operation (marked as correct, incorrect) for a question for a user
  undo(data: any) {
    const { participantId, question } = data;
    const part = this.instance.participants[participantId];

    if (!part) return;

    if (part.attempts[question] !== 0) {
      part.attempts[question] =
        Math.sign(part.attempts[question]) * (Math.abs(part.attempts[question]) - 1);
    }
  }

  // add a user
  userAdd(data: any) {
    const participant: LBParticipant = {
      id: this.instance.participants.length,
      name: data.name,
      attempts: new Array(this.instance.size).fill(0),
    };
    this.instance.participants.push(participant);
  }

  // remove a user
  userRemove(data: any) {
    this.instance.participants = this.instance.participants.filter(p => p.name !== data.name);
  }

  // TODO: implement
  save() {
    log("unimplemented (save)");
  }

  // TODO: implement
  load() {
    log("unimplemented (load)");
  }

  // checks if username is marked as admin in the instance
  isAdmin(username: string) {
    return this.instance.admins.includes(username);
  }

  // returns data as LBPartial
  toPartial(): LBPartial {
    return { score_values: this.instance.score_values, participants: this.instance.participants };
  }
}
