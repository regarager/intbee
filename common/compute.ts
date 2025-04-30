import { ComputeEngine } from "@cortex-js/compute-engine";

const ce = new ComputeEngine();

export function compute(expr: string): number {
  return ce.parse(expr).N().value as number;
}

export function approx(a: number, b: number) {
  return Math.abs(a - b) <= 1e-10;
}
