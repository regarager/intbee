import express from "express";
import { log, Problem } from "../util";

export const gymRouter = express.Router();

function parsePage(page: string) {
  if (!page) {
    return 1;
  }
  return parseInt(page) || -1;
}

gymRouter.get("/:page", async (req, res) => {
  const page = parsePage(req.params.page);

  const problems = await Problem.find()
    .skip((page - 1) * 50)
    .limit(5);

  log(problems);

  res.render(process.cwd() + "/views/gym.ejs", { problems });
});
