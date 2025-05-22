import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import expressWs from "express-ws";
import mongoose from "mongoose";
import path from "path";
import { exit } from "process";

import { getRank, log } from "@util/common";
import { file } from "@util/server";

import { loggingMiddleware } from "./logging";
import { adminRouter } from "./routes/admin";
import { authAPIRouter, authMiddleware } from "./routes/api/auth";
import { problemRouter } from "./routes/api/problem";
import { authRouter } from "./routes/auth";
import { gymRouter } from "./routes/gym";
import { lbRouter } from "./routes/lb";
import { rankedRouter } from "./routes/ranked";
import { wikiRouter } from "./routes/wiki";

// load .env variables
dotenv.config();

// check env variables being loaded
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

// setup express
const app = expressWs(express()).app;

// setup ejs
app.set("views", path.join(process.cwd(), "pages"));
app.set("view engine", "ejs");

// expose rank function to ejs
app.locals.getRank = getRank;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("dist"));
app.use(express.static("public"));

app.use(authMiddleware);
app.use(loggingMiddleware);

// routers
app.use("/api/auth", authAPIRouter);
app.use("/api/problem", problemRouter);

app.use("/auth", authRouter);
app.use("/gym", gymRouter);
app.use("/ranked", rankedRouter);
app.use("/wiki", wikiRouter);
app.use("/lb", lbRouter);

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
