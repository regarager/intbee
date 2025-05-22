import { randomBytes } from "crypto";
import path from "path";

import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

export function compute(expr: string): number {
  return ce.parse(expr).N().value as number;
}

export function approx(a: number, b: number) {
  return Math.abs(a - b) <= 1e-10;
}
export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}

export function uid(size = 16) {
  return randomBytes(size).toString("hex");
}

export interface UserPayload {
  username: string;
  iat: number;
  exp: number;
}
