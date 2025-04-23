import express from "express";
import { authOnly } from "./api/auth";
import { file } from "@common/util";

export const rankedRouter = express.Router();

const userToRoom = new Map<string, string>();
const rooms = new Set<string>();

rankedRouter.get("/", authOnly, (req, res) => {
  res.render(file("pages/queue.ejs"));
});

rankedRouter.get("/room/:id", authOnly, (req, res) => {
  res.render(file("pages/room.ejs"));
});
