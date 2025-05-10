import express from "express";
import { adminOnly } from "./api/auth";
import { file } from "@util/server";
import { Problem } from "@server/schemas";

export const adminRouter = express.Router();

adminRouter.get("/", adminOnly, (_, res) => {
  res.render(file("pages/home_admin.ejs"));
});

adminRouter.get("/problem/:id", adminOnly, async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.redirect("/error");
  } else {
    res.render(file("pages/problem_admin.ejs"), { problem });
  }
});
