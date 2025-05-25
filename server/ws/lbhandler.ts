import { WebSocket } from "ws";

import { LBInstance } from "@server/lbinstance";
import { uid } from "@util/server";

import { WSHandler } from "./wshandler";

const log = WSHandler.log;

// ws handler for leaderboard tool
export class LBHandler extends WSHandler {
  public instances: Map<string, LBInstance>;

  // creates new handler
  constructor() {
    super();
    this.instances = new Map<string, LBInstance>();
  }

  // processes ws requests
  async process(ws: WebSocket, username: string, data: any) {
    const action = data.action;
    const instanceId = data.id;
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    this.sockets.set(username, ws);
    instance.connections.add(ws);

    switch (action) {
      case "data": {
        ws.send(JSON.stringify(instance.toPartial()));
        break;
      }
      case "correct": {
        instance.correct(data.participantId, data.question);
        break;
      }

      case "incorrect": {
        instance.incorrect(data.participantId, data.question);
        break;
      }

      case "undo": {
        instance.undo(data.participantId, data.question);
        break;
      }

      case "user-add": {
        instance.add(data.name);
        break;
      }

      case "user-remove": {
        instance.remove(data.name);
        break;
      }
    }

    this.update(instance);
  }

  createInstance({
    size,
    score_values,
    admins,
  }: {
    size: number;
    score_values: number[];
    admins: string[];
  }): [string, LBInstance] {
    const instance = new LBInstance(size, score_values, admins);
    const id = uid(8);
    log(`Created new LB tool instance with id ${id}`);
    this.instances.set(id, instance);

    return [id, instance];
  }

  update(instance: LBInstance) {
    instance.connections.forEach(ws => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(instance.toPartial()));
      }
    });
  }

  // TODO: implement
  save() {
    log("unimplemented (save)");
  }

  // TODO: implement
  load() {
    log("unimplemented (load)");
  }
}
