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

export function getRank(r: number) {
  return [
    "newbie",
    "apprentice",
    "novice",
    "intermediate",
    "expert",
    "master",
    "wizard",
    "demon",
    "orz",
  ][Math.min(Math.max(Math.floor((r - 1) / 500), 0), 8)];
}

export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}

export interface Pair<T1, T2> {
  first: T1;
  second: T2;
}

export function make_pair<T1, T2>(first: T1, second: T2): Pair<T1, T2> {
  return { first, second };
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

interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

export class Queue<T> {
  private head: QueueNode<T> | null;
  private tail: QueueNode<T> | null;
  private length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(value: T) {
    const node: QueueNode<T> = { value, next: null };

    if (this.head === null) {
      this.head = node;
      this.tail = this.head;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
  }

  dequeue() {
    const res = this.head.value;

    this.head = this.head.next;

    return res;
  }

  slice(length: number) {
    const res = [];
    let curr = this.head;

    for (let i = 0; i < length; i++) {
      if (curr === null) break;
      res.push(curr.value);
      curr = curr.next;
    }

    return res;
  }

  size() {
    return this.length;
  }
}
