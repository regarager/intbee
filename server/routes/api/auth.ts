import express, { NextFunction, Request, Response } from "express";
import argon2 from "argon2";
import { log } from "@util/common";
import { UserPayload } from "@util/server";
import { User } from "@server/schemas";
import dotenv from "dotenv";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

export const authAPIRouter = express.Router();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token ?? "";

  jwt.verify(
    token,
    JWT_SECRET,
    async (_: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (decoded) {
        req.user = decoded as UserPayload;

        const { username } = req.user;

        const dbUser = await User.findOne({ username });

        req.user.role = dbUser ? dbUser.role : "user";
      }

      res.locals.user = req.user;

      next();
    },
  );
};

export const authOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    next();
  } else {
    log(`Unauthenticated request to ${req.url}`);
    res.redirect("/auth/login");
  }
};

export const moderatorOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
    log(`${req.user.role} ${req.user.username} accessed ${req.originalUrl}`);
    next();
  } else {
    log(`Unauthenticated request to ${req.url} (moderator protected)`);
    res.redirect("/");
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    log(`${req.user.role} ${req.user.username} accessed ${req.originalUrl}`);
    next();
  } else {
    log(`Unauthenticated request to ${req.url} (admin protected)`);
    res.redirect("/");
  }
};

authAPIRouter.post("/login", async (req, res) => {
  if (!req.body) {
    res.send(`<span style="color: red;">Failed login</span>`);
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    log("Failed attempt to log in, missing username or password");
    res.send(`<span style="color: red;">Failed login</span>`);
    return;
  }

  const user = await User.findOne({ username }).exec();

  if (user === null) {
    res.status(407).send({ message: `User ${username} does not exist` });
  } else if (await argon2.verify(user.password!, password)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });

    log(`User ${username} logged in`);
    res
      .cookie("token", token, { maxAge: 86400 * 1000 })
      .set("HX-Redirect", "/gym")
      .send("OK");
  } else {
    log(`Unsuccessful authentication for user ${username}`);
    res.send(`<span style="color: red;">Failed login</span>`);
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
    log("Failed attempt to log in, missing username, email, or password");
    res.send(`<span style="color: red;">Failed sign up</span>`);
    return;
  }

  if (await User.exists({ username })) {
    log(`Failed authentication: Account with username ${username} already exists`);
    res.send(`<span style="color: red;">Username already taken</span>`);
    return;
  } else if (await User.exists({ email })) {
    log(`Failed authentication: Account with email ${email} already exists`);
    res.send(`<span style="color: red;">Account ${email} already exists</span>`);
    return;
  }

  const hashed = await argon2.hash(password);

  const user = new User({ username, email, password: hashed, rating: 500, role: "user" });
  await user.save();

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });

  res
    .cookie("token", token, { maxAge: 86400 * 1000 })
    .set("HX-Redirect", "/gym")
    .send("OK");
});
