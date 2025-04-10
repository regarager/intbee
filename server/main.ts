import express from "express";
import http from "http";
import ws from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { log } from "./util";
import path from "path";
import { authRouter } from "./routes/auth";
import { gymRouter } from "./routes/gym";
dotenv.config();

log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then(() => log("connected to mongoose"));

const app = express();
const server = http.createServer(app);
const wss = new ws.WebSocketServer({ server, path: "/api/ws/" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", authRouter);
app.use("/gym", gymRouter);

app.use(express.static("dist"));
app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

wss.on("connection", () => {
  log("client connected to websocket server");
});

server.listen(process.env.PORT || 3000, async () => {
  log("started server");
});
