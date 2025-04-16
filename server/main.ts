import express, { NextFunction, Request, Response } from "express";
import http from "http";
import ws from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { file, log } from "./util";
import path from "path";
import { authRouter } from "./routes/auth";
import { gymRouter } from "./routes/gym";
import { authAPIRouter } from "./routes/api/auth";
import { apiRouter } from "./routes/api";

dotenv.config();

log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then(() => log("connected to mongoose"));

const app = express();
const server = http.createServer(app);
const wss = new ws.WebSocketServer({ server, path: "/api/ws/" });

app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "ejs");

app.locals.getRank = (r: number) =>
  ["newbie", "apprentice", "novice", "intermediate", "expert", "master", "wizard", "demon", "orz"][
    Math.min(Math.max(Math.floor((r - 1) / 500), 0), 8)
  ];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("dist"));
app.use(express.static("public"));

app.use("/api/auth", authAPIRouter);
app.use("/api", apiRouter);

app.use("/auth", authRouter);
app.use("/gym", gymRouter);

app.use((_: Request, res: Response) => {
  res.render(file("pages/404.ejs"));
});

wss.on("connection", () => {
  log("client connected to websocket server");
});

server.listen(process.env.PORT || 3000, async () => {
  log("started server");
});
