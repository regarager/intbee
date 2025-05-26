import express from "express";
import { marked } from "marked";

import { Tag } from "@server/schemas";
import { file } from "@util/server";

export const wikiRouter = express.Router();

let tags: string[];

// list all articles
async function loadArticles() {
  const all = await Tag.find({});

  tags = all.map(doc => doc.tag!);
}

loadArticles();

// wiki home page
wikiRouter.get("/", async (_, res) => {
  res.render(file("/pages/wiki.ejs"), { tags });
});

// render specific article
wikiRouter.get("/:tag", async (req, res) => {
  const tag = req.params.tag;

  const tagContent = await Tag.findOne({ tag });

  if (!tagContent) {
    res.redirect("/error");
    return;
  }

  const content = tagContent.content ?? "";
  const output = marked(content.replace(/\\/g, "\\\\"), { async: false });
  res.render(file("/pages/wiki_page.ejs"), { content: output, tag: tagContent.tag });
});

// not sure what this does
// TODO: remove route
wikiRouter.get("/problem/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const tag = await Tag.findById(id);

  if (tag == null) {
    res.redirect("/error");
  } else {
    res.render(file("/pages/problem.ejs"), { tag });
  }
});
