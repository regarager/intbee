import { randomBytes } from "crypto";
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

export function uid(size = 16) {
  return randomBytes(size).toString("hex");
}
