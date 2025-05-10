import express from "express";
import { file } from "@util/server";
import { Tag } from "@server/schemas";

export const wikiRouter = express.Router();

function parsePage(page: string) {
  if (!page) {
    return 1;
  }
  return parseInt(page) || -1;
}

wikiRouter.get("/", async (_, res) => {
  res.redirect("/wiki/1");
});

wikiRouter.get("/:page", async (req, res) => {
  const page = Math.min(parsePage(req.params.page), 1);
  const size = 40;

  const tags = await Tag.find()
    .skip((page - 1) * size)
    .limit(size);

  res.render(file("/pages/wiki.ejs"), { tags });
});

wikiRouter.get("/problem/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const tag = await Tag.findById(id);

  if (tag == null) {
    res.redirect("/error");
  } else {
    res.render(file("/pages/problem.ejs"), { tag });
  }
});
