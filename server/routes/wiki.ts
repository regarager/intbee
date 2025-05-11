import express from "express";
import { file } from "@util/server";
import { Tag } from "@server/schemas";
import { Pair } from "@util/structs";
import { marked } from "marked";
import { log } from "@util/common";

export const wikiRouter = express.Router();

let tags: string[];

const compiledMD = new Map<string, string>();

async function loadArticles() {
  const all = await Tag.find({});

  tags = all.map(doc => doc.tag!);
}

loadArticles();

wikiRouter.get("/", async (_, res) => {
  res.render(file("/pages/wiki.ejs"), { tags });
});

wikiRouter.get("/:tag", async (req, res) => {
  const tag = req.params.tag;

  const tagContent = await Tag.findOne({ tag });

  if (!tagContent) {
    res.redirect("/error");
    return;
  }

  let output: string;
  if (!compiledMD.has(tag)) {
    output = await marked(tagContent.content ?? "");
    compiledMD.set(tag, output);
  } else {
    output = compiledMD.get(tag)!;
    marked(tagContent.content ?? "", { async: true }).then(res => compiledMD.set(tag, res));
  }

  res.render(file("/pages/wiki_page.ejs"), { content: output, tag: tagContent.tag });
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
