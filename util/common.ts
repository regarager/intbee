// formats date in HH:MM:SS
function formatDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `[${hours}:${minutes}:${seconds}]`;
}

// adds time to front of each log
export function log(...data: any[]) {
  console.log(formatDate(new Date()), ...data);
}

// tries to parse json, returns null if error
export function jsonParse(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// min and max in one function
export function clamp(x: number, lower: number = 0, upper: number = Infinity) {
  return Math.max(Math.min(x, upper), lower);
}

// possible ws requests for game room
export enum RankedAction {
  SUBMIT = "submit",
  UPDATE = "update",
}

// possible ws requests for queue
export enum QueueAction {
  INIT = "init",
  QUEUE = "queue",
  REDIRECT = "redirect",
  UPDATE = "update",
}

// tag enum, also used for articles in wiki
export enum TagType {
  BETA = "beta",
  CONTOUR = "contour",
  FEYNMAN = "feynman",
  GAMMA = "gamma",
  GEOMETRY = "geometry",
  IBP = "ibp",
  IMPROPER = "improper",
  PARFRACS = "parfracs",
  SERIES = "series",
  SUBSTITUTION = "substitution",
  TRIG = "trig",
}

// converts rating to rank
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

// contains game info to send to client (reduced Game)
export interface GamePartial {
  player: number;
  players: string[];
  problem: string;
  ratingChanges: number[];
  ratings: number[];
  round: number;
  score: number[];
  winner: number;
  roundEndTime: number;
}

// contains problem info to send/receive from client (reduced Problem schema)
export interface ProblemPartial {
  latex: string;
  answer: string;
  rating: number;
  tags: string[];
}

// contains participant info for leaderboard tool
export interface LBParticipant {
  pid: number;
  name: string;
  attempts: number[];
}

// contains data for leaderboard instance
export interface LBPartial {
  score_values: number[];
  participants: LBParticipant[];
  size: number;
}

// contains data for tag/wiki article
export interface TagPartial {
  content: string;
  tag: TagType;
}

// appends action property to data object
export function action(act: any, data: any) {
  return JSON.stringify({ action: act, data });
}

// configuration for ranked game
export const RANKED_TIMER = 120;
export const RANKED_MAX_ROUNDS = 5;
