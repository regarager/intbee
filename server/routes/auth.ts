import express from "express";
import { file } from "@common/util";
import dotenv from "dotenv";

dotenv.config();

export const authRouter = express.Router();

// TODO: redirect to a user page

authRouter.get("/login", (req, res) => {
  if (req.user) {
    res.redirect("/gym");
  } else {
    res.render(file("/pages/login.ejs"));
  }
});

authRouter.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/gym");
  } else {
    res.render(file("/pages/register.ejs"));
  }
});
