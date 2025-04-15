import express from "express";
import { file, Problem } from "../util";

export const gymRouter = express.Router();

function parsePage(page: string) {
  if (!page) {
    return 1;
  }
  return parseInt(page) || -1;
}

gymRouter.get("/", async (_, res) => {
  res.redirect("/gym/1");
});

gymRouter.get("/:page", async (req, res) => {
  const page = Math.min(parsePage(req.params.page), 1);

  const problems = await Problem.find()
    .skip((page - 1) * 50)
    .limit(50);

  res.render(file("/pages/gym.ejs"), { problems });
});

gymRouter.get("/problem/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.redirect("/error");
  } else {
    res.render(file("/pages/problem.ejs"), { problem });
  }
});
