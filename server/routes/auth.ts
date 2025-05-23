import dotenv from "dotenv";
import express from "express";

import { file } from "@util/server";

dotenv.config();

export const authRouter = express.Router();

// login page
authRouter.get("/login", (req, res) => {
  if (req.user) {
    res.redirect("/gym");
  } else {
    res.render(file("/pages/login.ejs"));
  }
});

// register page
authRouter.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/gym");
  } else {
    res.render(file("/pages/register.ejs"));
  }
});

// log people out (clear auth cookie)
authRouter.get("/logout", (_, res) => {
  res.clearCookie("token");

  res.redirect("/gym");
});
