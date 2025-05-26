import express from "express";
import { marked } from "marked";

import { Tag } from "@server/schemas";
import { file } from "@util/server";
import { make_pair, Pair } from "@util/structs";

export const wikiRouter = express.Router();

let tags: Pair<string, string>[];

// list all articles
async function loadArticles() {
  const all = await Tag.find({});

  tags = all.map(doc => make_pair(doc.tag!, doc.display!));
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
  res.render(file("/pages/wiki_page.ejs"), {
    content: output,
    tag: tagContent.tag,
    display: tagContent.display,
  });
});
