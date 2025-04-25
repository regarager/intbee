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
  ][clamp(Math.floor((r - 1) / 500), 0, 8)];
}

export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}

export function uid(size = 16) {
  return randomBytes(size).toString("hex");
}

export function clamp(x: number, lower: number = 0, upper: number = Infinity) {
  return Math.max(Math.min(x, upper), lower);
}

export interface UserPayload {
  username: string;
  iat: number;
  exp: number;
}

export function msg(message: string) {
  return { message };
}
