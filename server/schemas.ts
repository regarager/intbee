import mongoose, { Schema } from "mongoose";

import { TagType } from "@util/common";

// user schema
export const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: ["user"],
    },
    rating: Number,
    solved: [String],
  }),
);

// problem schema
export const Problem = mongoose.model(
  "Problem",
  new Schema({
    latex: String,
    variable: String,
    answer: String,
    rating: Number,
    tags: [String],
  }),
);

// tag/wiki article schema
export const Tag = mongoose.model(
  "Tag",
  new Schema({
    content: String,
    tag: {
      type: String,
      enum: Object.values(TagType),
    },
    display: String, // properly formatted version of tag name
  }),
);

// leaderboard tool schema
export const LBTool = mongoose.model(
  "LBTool",
  new Schema({
    score_values: [Number],
    participants: [
      {
        pid: Number,
        name: String,
        attempts: [Number],
      },
    ],
    admins: [String],
    size: Number,
  }),
);
