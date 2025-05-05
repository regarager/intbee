import express from "express";
import { adminOnly } from "./api/auth";
import { file } from "@util/server";

export const adminRouter = express.Router();

adminRouter.get("/", adminOnly, (_, res) => {
  res.render(file("pages/admin_home.ejs"));
});
