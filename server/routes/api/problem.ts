import express from "express";
import { Problem } from "@server/schemas";
import { ComputeEngine } from "@cortex-js/compute-engine";

export const problemRouter = express.Router();

const ce = new ComputeEngine();

function compute(expr: string): number {
  return ce.parse(expr).evaluate().value as number;
}

problemRouter.post("/:id/verify", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.send({ error: "problem not found" });
  } else {
    const latex: string = (req.body.latex ?? "").replace(/ /g, "");
    const solution = problem.answer!.replace(/ /g, "");

    // compute working
    // TODO: rewrite all of the answers

    res.send({ result: latex === solution });
  }
});
