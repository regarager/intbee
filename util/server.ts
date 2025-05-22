import crypto from "crypto";
import path from "path";

import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

// evaluates math expression to float
export function compute(expr: string): number {
  return ce.parse(expr).N().value as number;
}

// checks if two values are approximately equal (to account for float inaccuracy)
export function approx(a: number, b: number) {
  return Math.abs(a - b) <= 1e-10;
}

// user auth object (attached to express request)
export interface UserPayload {
  username: string;
  role: string;
  iat: number;
  eat: number;
}

// util function for file path
export function file(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

// generates hexcode uid
export function uid(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}
