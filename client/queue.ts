import { action, QueueAction, getRank } from "@util/common";
import { Pair } from "@util/structs";

function main() {
  const wsUrl = "ws://localhost:3000/ranked/ws/queue";
  const socket = new WebSocket(wsUrl);

  const queue = document.getElementById("queue") as HTMLOListElement;
  const queuebtn = document.getElementById("queue-btn") as HTMLButtonElement;

  async function updateQueue() {
    console.log("Updating queue...");

    queue.innerHTML = "";
    try {
      const queueData = (await (await fetch("/ranked/queue")).json()) as Pair<string, number>[];

      console.log(`Received queue data: ${queueData}`);

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
    socket.send(action(QueueAction.INIT, {}));
  };

  socket.onmessage = ev => {
    const data = JSON.parse(ev.data);

    if (data.action === QueueAction.UPDATE) {
      updateQueue();
    } else if (data.action === "redirect") {
      const gameId = data.data.gameId;

      window.location.href = "/ranked/room/" + gameId;
    }
  };

  queuebtn.addEventListener("click", () => {
    socket.send(action(QueueAction.QUEUE, {}));
  });
}

main();
