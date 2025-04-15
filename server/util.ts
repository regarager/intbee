import mongoose, { Schema } from "mongoose";
import path from "path";

function formatDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `[${hours}:${minutes}:${seconds}]`;
}

export function log(...data: any[]) {
  console.log(formatDate(new Date()), ...data);
}

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

export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}
