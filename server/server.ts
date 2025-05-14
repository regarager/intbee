import express from "express";
import path from "path";
import WebSocket from "ws";
import http from "http";
import { Participant as IParticipant } from "./types";
import { readFileSync, writeFileSync } from "fs";

function log(...data: any[]) {
  console.log(`[${new Date().toISOString()}]`, ...data);
}

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "public")));

let state: IParticipant[] = [];
const key = new Map<string, number>();

function addUser(name: string, official: boolean = true) {
  key.set(name, state.length);
  state.push({
    id: state.length,
    name: name,
    attempts: Array(17).fill(0),
    official: official,
  });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "leaderboard.ejs"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "adminlb.ejs"));
});

const broadcast = (callback: (client: WebSocket) => any) =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      callback(client);
    }
  });

wss.on("connection", ws => {
  log("Client connected");

  const update = () => broadcast(client => client.send(JSON.stringify(state)));
  ws.on("message", message => {
    const data = JSON.parse(message + "");

    log(data);

    if (data["request"] === "data") {
    } else if (data["request"] == "admin-add") {
      addUser(data["name"]);
      log("added user");
    } else if (data["request"] == "admin-remove") {
      state = state.filter(p => p.id !== parseInt(data["id"]));
      log("removed " + data["id"]);
    } else if (data["request"] == "admin-wrong") {
      const index = state.findIndex(p => p.id === parseInt(data["id"]));
      state[index].attempts[parseInt(data["question"])]--;
      log(`wrong submission for user ${data["id"]} on question ${data["question"]}`);
    } else if (data["request"] == "admin-correct") {
      const index = state.findIndex(p => p.id === parseInt(data["id"]));
      const attempts = state[index].attempts[parseInt(data["question"])];
      state[index].attempts[parseInt(data["question"])] = Math.abs(attempts) + 1;
      log(`correct submission for user ${data["id"]} on question ${data["question"]}`);
    } else if (data["request"] == "admin-undo") {
      const index = state.findIndex(p => p.id === parseInt(data["id"]));
      const attempts = state[index].attempts[parseInt(data["question"])];
      const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
      state[index].attempts[attempts] -= sign(attempts);
      log(`undid last change on user ${data["id"]} on question ${data["question"]}`);
    } else if (data["request"] == "admin-toggle-official") {
      const index = state.findIndex(p => p.id === parseInt(data["id"]));
      state[index].official = !state[index].official;
      log(
        `user ${data["id"]} is now ${state[index].official ? "in" : "not in"} the official leaderboards`,
      );
    } else if (data["request"] == "admin-save") {
      writeFileSync("data.json", JSON.stringify(state));
      log("saved data");
    } else if (data["request"] == "admin-load") {
      const content = readFileSync("data.json", "utf-8");

      state = JSON.parse(content) as IParticipant[];
      log("loaded data");
    }

    update();
  });

  ws.on("close", () => {
    log("Client disconnected");
  });
});

server.listen(PORT, () => {
  log("Server started");
});
