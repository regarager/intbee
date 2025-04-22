import express, { NextFunction, Request, Response } from "express";
import argon2 from "argon2";
import { log, User } from "../../util";
import dotenv from "dotenv";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET;

export interface UserPayload {
  username: string;
  iat: number;
  exp: number;
}

export const authAPIRouter = express.Router();
export const verify = (
  token: string,
  callback: (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => void,
) => {
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    callback(err, decoded);
  });
};

export const authOnly = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token ?? "";

  verify(token, (err, user: UserPayload | undefined) => {
    if (err) {
      log(`Unauthenticated request to ${req.url}`);
      res.redirect("/auth/login");
    } else {
      log(`User ${user.username} accessed ${req.url}`);
      next();
    }
  });
};

authAPIRouter.post("/login", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Authentication failure" });
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send({ message: "Authentication failure" });
    return;
  }

  const user = await User.findOne({ username }).exec();

  if (user === null) {
    res.status(407).send({ message: `User ${username} does not exist` });
  } else if (await argon2.verify(user.password, password)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    res
      .status(200)
      .cookie("token", token, { maxAge: 86400 * 1000 })
      .send({ message: "Successfully authenticated!", token });
  } else {
    res.status(407).send({ message: "Authentication failure" });
  }
});

authAPIRouter.post("/register", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Authentication failure" });
    return;
  }

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if (!username || !password || !email) {
    res.status(400).send({ message: "Authentication failure" });
    return;
  }

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
  res
    .status(200)
    .cookie("token", token, { maxAge: 86400 * 1000 })
    .send({ message: "Successfully registered!", token });
});
