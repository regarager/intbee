function getRank(r: number) {
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

interface UserData {
  first: string;
  second: number;
}

const wsUrl = "ws://localhost:3000/api/ws";
const socket = new WebSocket(wsUrl);

let id = "";
let username = "";

const queue = document.getElementById("queue") as HTMLOListElement;
const queuebtn = document.getElementById("queue-btn") as HTMLButtonElement;

async function updateQueue() {
  try {
    const queueData = (await (await fetch("/api/ws/queue")).json()) as UserData[];

    queueData.forEach(data => {
      const username = data.first;
      const element = document.createElement("li");

      const rank = getRank(data.second);

      if (rank === "orz") {
        const first = document.createElement("span");
        first.innerText = username[0];
        first.className = "c-orz-first-letter";

        const second = document.createElement("span");
        second.innerText = username.slice(1);
        second.className = "c-orz";

        element.append(first, second);
      } else {
        const child = document.createElement("span");
        child.innerText = username;
        child.className = `c-${rank}`;

        element.append(child);
      }

      queue.append(element);
    });
  } catch {}
}

updateQueue();

socket.onopen = () => {
  console.log("Connected to ws");
};

socket.onmessage = ev => {
  const data = JSON.parse(ev.data);

  if (data.id) id = data.id;
  if (data.username) username = data.username;
};

queuebtn.addEventListener("click", () => {
  socket.send(JSON.stringify({ action: "queue", username: username }));
});
