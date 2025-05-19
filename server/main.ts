import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import path from "path";
import cookieParser from "cookie-parser";
import expressWs from "express-ws";
import { exit } from "process";

import { file } from "@util/server";
import { getRank, log } from "@util/common";

import { authRouter } from "./routes/auth";
import { gymRouter } from "./routes/gym";
import { wikiRouter } from "./routes/wiki";
import { authAPIRouter, authMiddleware } from "./routes/api/auth";
import { problemRouter } from "./routes/api/problem";
import { rankedRouter } from "./routes/ranked";
import { adminRouter } from "./routes/admin";
import { LBRouter } from "./routes/lb";

import { loggingMiddleware } from "./logging";

dotenv.config();

if (process.env.MONGO_URL) {
  mongoose.connect(process.env.MONGO_URL).then(() => log("connected to mongoose"));
} else {
  console.error("MONGO_URL environment variable not set");
  exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET environment variable not set");
  exit(1);
}

const app = expressWs(express()).app;

app.set("views", path.join(process.cwd(), "pages"));
app.set("view engine", "ejs");

app.locals.getRank = getRank;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("dist"));
app.use(express.static("public"));

app.use(authMiddleware);
app.use(loggingMiddleware);

app.use("/api/auth", authAPIRouter);
app.use("/api/problem", problemRouter);

app.use("/auth", authRouter);
app.use("/gym", gymRouter);
app.use("/ranked", rankedRouter);
app.use("/wiki", wikiRouter);
app.use("/lb", LBRouter);

app.use("/admin", adminRouter);

app.get("/", (_, res) => {
  res.redirect("/gym");
});

app.use((_: Request, res: Response) => {
  res.render(file("pages/404.ejs"));
});

app.listen(process.env.PORT || 3000, async () => {
  log("started server");
});
