import express from "express";
import argon2 from "argon2";
import { User } from "../util";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).exec();

  if (user === null) {
    res.status(407).send({ message: `User ${username} does not exist` });
  } else if (await argon2.verify(user.password, password)) {
    res.status(200).send({ message: "Successfully authenticated!" });
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

  res.status(200).send({ message: "Successfully registered!" });
});
