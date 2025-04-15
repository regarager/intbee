import express, { NextFunction, Request, Response } from "express";
import argon2 from "argon2";
import { file, User } from "../util";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET;

export const authRouter = express.Router();
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.split(" ")[1] ?? "";

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403);
    });
  }
};

authRouter.get("/login", (req, res) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.split(" ")[1] ?? "";

  if (token) {
    jwt.verify(token, JWT_SECRET, err => {
      if (err) res.sendFile(file("/pages/login.html"));
      else res.redirect("/gym");
    });
  }
  res.sendFile(file("/pages/login.html"));
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
