function formatDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `[${hours}:${minutes}:${seconds}]`;
}

export function log(...data: any[]) {
  console.log(formatDate(new Date()), ...data);
}

export function clamp(x: number, lower: number = 0, upper: number = Infinity) {
  return Math.max(Math.min(x, upper), lower);
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

export function msg(message: string) {
  return { message };
}
