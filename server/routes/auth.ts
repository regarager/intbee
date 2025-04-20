import express from "express";
import { file } from "../util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET;

export const authRouter = express.Router();

authRouter.get("/login", (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.split(" ")[1] ?? "";

  if (token) {
    jwt.verify(token, JWT_SECRET, err => {
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
    jwt.verify(token, JWT_SECRET, err => {
      if (err) res.sendFile(file("/pages/register.html"));
      else res.redirect("/gym");
    });
  } else res.sendFile(file("/pages/register.html"));
});
