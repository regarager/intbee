import crypto from "crypto";
import path from "path";

import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

export function compute(expr: string): number {
  return ce.parse(expr).N().value as number;
}

export function approx(a: number, b: number) {
  return Math.abs(a - b) <= 1e-10;
}

export interface UserPayload {
  username: string;
  role: string;
  iat: number;
  eat: number;
}

export function file(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

export function uid(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}
