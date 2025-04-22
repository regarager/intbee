import express from "express";
import { file } from "../util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { verify } from "./api/auth";

dotenv.config();

export const authRouter = express.Router();

authRouter.get("/login", (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.split(" ")[1] ?? "";

  if (token) {
    verify(token, err => {
      if (err) res.render(file("/pages/login.ejs"));
      else res.redirect("/gym");
    });
  }
  res.render(file("/pages/login.ejs"));
});

authRouter.get("/register", (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.split(" ")[1] ?? "";

  if (token) {
    verify(token, err => {
      if (err) res.sendFile(file("/pages/register.html"));
      else res.redirect("/gym");
    });
  } else res.sendFile(file("/pages/register.html"));
});
