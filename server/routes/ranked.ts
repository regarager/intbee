import express from "express";
import { authOnly } from "./api/auth";
import { file } from "../util";

export const rankedRouter = express.Router();

rankedRouter.get("/", authOnly, (req, res) => {
  res.render(file("pages/queue.ejs"));
});
