import express from "express";

import { Problem, Tag } from "@server/schemas";
import { log, TagPartial, TagType } from "@util/common";
import { file } from "@util/server";

import { adminOnly } from "./api/auth";

export const adminRouter = express.Router();

adminRouter.use("/", adminOnly);

// show all admin pages
adminRouter.get("/", (_, res) => {
  res.render(file("pages/home_admin.ejs"));
});

// update/create new problem
adminRouter.post("/problem/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const data = { ...req.body, tags: req.body.tags.replaceAll(" ", "").split(",") };

  if (!data.tags) return;
  data.tags = data.tags.sort();

  if (id === "new") {
    if (!data) {
      res.status(400);
      return;
    }

    // TODO: allow integration with different variables
    await Problem.create({
      ...req.body,
      variable: "x",
    });
  } else {
    const problem = await Problem.findById(id);

    if (problem === null) {
      res.status(400);
    } else {
      log(`Updating problem ${id}`);

      await problem.updateOne(data);
    }
  }

  res.set("HX-Redirect", "/gym").send("OK");
});

// create new problem
adminRouter.get("/problem/new", async (_, res) => {
  const problem = { latex: "", answer: "", rating: 0, tags: [], variable: "x" };
  res.render(file("pages/problem_admin.ejs"), { problem });
});

// render problem page in admin view
adminRouter.get("/problem/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const problem = await Problem.findById(id);

  if (problem == null) {
    res.redirect("/error");
  } else {
    res.render(file("pages/problem_admin.ejs"), { problem });
  }
});

// problem editor but for a new problem instead of existing
adminRouter.get("/problem/new", async (_, res) => {
  const tag = { content: "Lorem ipsum", tag: "" };
  res.render(file("pages/wiki_admin.ejs"), { tag });
});

// wiki editor
adminRouter.get("/wiki/:id", async (req, res) => {
  const id = req.params.id ?? "";

  const tag = await Tag.findOne({ tag: id });

  if (tag == null) {
    res.redirect("/error");
  } else {
    const content = tag.content!.replace(/\\/g, "\\\\");
    res.render(file("pages/wiki_admin.ejs"), { tag: tag.tag, content });
  }
});

// update wiki article data
adminRouter.post("/wiki/", async (req, res) => {
  const data = req.body as TagPartial;

  if (!Object.values(TagType).includes(data.tag)) {
    log(`Invalid tag: ${data.tag}`);
    res.status(400);
    return;
  }

  const tag = await Tag.findOne({ tag: data.tag });

  if (tag === null) {
    await Tag.create({ tag: data.tag, content: data.content });
  } else {
    await Tag.findOne({ tag: data.tag }).updateOne({ content: data.content });
  }

  log(`Updated tag ${data.tag}`);

  res.send("OK");
});
