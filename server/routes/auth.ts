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

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).exec();

  if (user === null) {
    res.status(407).send({ message: `User ${username} does not exist` });
  } else if (await argon2.verify(user.password, password)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    res.status(200).send({ message: "Successfully authenticated!", token });
  } else {
    res.status(407).send({ message: "Authentication failure" });
  }
});

authRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (await User.exists({ username })) {
    res.status(409).send({ error: `Account with username ${username} already exists` });
    return;
  } else if (await User.exists({ email })) {
    res.status(409).send({ error: `Account with email ${email} already exists` });
    return;
  }

  const hashed = await argon2.hash(password);

  const user = new User({ username, email, password: hashed, rating: 500, role: "user" });
  await user.save();

  const token = jwt.sign(username, JWT_SECRET, { expiresIn: "24h" });
  res.status(200).send({ message: "Successfully registered!", token });
});
