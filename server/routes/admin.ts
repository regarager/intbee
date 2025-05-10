import express from "express";
import { adminOnly } from "./api/auth";
import { file } from "@util/server";
import { Problem } from "@server/schemas";
import { log, msg, ProblemPartial } from "@util/common";

export const adminRouter = express.Router();

adminRouter.get("/", adminOnly, (_, res) => {
  res.render(file("pages/home_admin.ejs"));
});

adminRouter.post("/problem/:id", adminOnly, async (req, res) => {
  const id = req.params.id ?? "";

  const data = req.body as ProblemPartial;

  if (id === "new") {
    if (!data) {
      res.status(400);
      return;
    }

    // TODO: allow integration with different variables
    await Problem.create({
      ...req.body,
      variable: "x",
    });
    res.send(msg("Success!"));
  }

  const problem = await Problem.findById(id);

  if (problem === null) {
    res.status(400);
  } else {
    log(`Updating problem ${id}`);
    log(data);

    await problem.updateOne(data);

    res.send(msg("Success!"));
  }
});

adminRouter.get("/problem/new", adminOnly, async (_, res) => {
  const problem = { latex: "", answer: "", rating: 0, tags: [], variable: "x" };
  res.render(file("pages/problem_admin.ejs"), { problem });
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
