import express from "express";
import { file, Problem } from "../util";

export const apiRouter = express.Router();

apiRouter.post("/problem/:id/verify", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.status(404);
  } else {
    const latex: string = (req.body.latex ?? "").replace(/ /g, "");
    const solution = problem.answer.replace(/ /g, "");

    res.send({ result: latex === solution });
  }
});
