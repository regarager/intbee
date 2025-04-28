import express from "express";
import { Problem } from "@server/schemas";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { log } from "@common/util";

export const problemRouter = express.Router();

const ce = new ComputeEngine();

function compute(expr: string): number {
  return ce.parse(expr).N().value as number;
}

function approx(a: number, b: number) {
  return Math.abs(a - b) <= 1e-10;
}

problemRouter.post("/:id/verify", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.send({ error: "problem not found" });
  } else {
    const latex: string = (req.body.latex ?? "").replace(/ /g, "");
    const solution = problem.answer!.replace(/ /g, "");

    if (req.user) {
      log(
        `${req.user.username} submitted answer ${latex} to problem ${id} (eval: ${compute(latex)})`,
      );
    } else {
      log(`Answer ${latex} submitted to problem ${id} (eval: ${compute(latex)})`);
    }

    const result = approx(compute(latex), compute(solution));

    log(`Correct: ${result}, answer was ${compute(solution)}`);

    // compute working
    // TODO: rewrite all of the answers

    res.send({ result });
  }
});
