import express from "express";
import { Problem } from "@server/schemas";
import { log } from "@util/common";
import { approx, compute } from "@util/server";

export const problemRouter = express.Router();

problemRouter.get("/:id/solution", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (!problem) {
    res.send("problem not found");
  } else {
    res.send(`$$${problem.latex}$$`);
  }
});

problemRouter.post("/:id/verify", async (req, res) => {
  log(req.body);
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

    if (result) {
      res.send(`<p class="correct">Verdict: correct!</p>`);
    } else {
      res.send(`<p class="incorrect">Verdict: incorrect</p>`);
    }
  }
});
