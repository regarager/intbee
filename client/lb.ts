import { LBPartial, LBParticipant } from "@util/common";

const tbody = document.getElementById("tbody")!;
const { id } = (document.querySelector(".container") as HTMLDivElement).dataset!;

const wsUrl = "ws://localhost:3000/lb";

const socket = new WebSocket(wsUrl);

const score = [5, 5, 5, 5, 5, 8, 8, 8, 8, 8, 11, 11, 11, 11, 11, 15, 15]; // scores of questions

// returns score of participant
function getScore(participant: LBParticipant) {
  let ans = 0;

  for (let i = 0; i < participant.attempts.length; i++) {
    ans += participant.attempts[i] > 0 ? score[i] : 0;
  }

  return ans;
}

function formatName(name: string) {
  // currently unused
  return name;
}

// updates leaderboard
function updateLeaderboard(data: LBParticipant[]) {
  data = data.sort((a, b) => getScore(b) - getScore(a));

  tbody.innerHTML = "";

  let i = 0;

  const top_three = ["gold", "silver", "bronze"]; // colors

  for (const participant of data) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    const name = document.createElement("td");
    id.innerText = participant.id.toString();
    name.innerText = formatName(participant.name);

    if (i < 3) name.classList.add(top_three[i]);

    tr.append(id);
    tr.appendChild(name);

    participant.attempts.forEach(x => {
      const problem = document.createElement("td");
      const status = x === 0 ? "unattempted" : x > 0 ? "correct" : "wrong";

      problem.classList.add(status);

      if (status === "correct") {
        problem.innerText = x.toString();
      } else if (status === "wrong") {
        problem.innerText = "X".repeat(-x);
      }

      tr.appendChild(problem);
    });

    const pts = document.createElement("td");
    pts.innerText = getScore(participant).toString();
    pts.style.color = "green";

    tr.appendChild(pts);

    tbody.appendChild(tr);
    i++;
  }
}

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ action: "data", id }));
});

socket.addEventListener("message", ev => {
  const content = ev.data + "";
  const data = JSON.parse(content) as LBPartial;
  updateLeaderboard(data.participants);
});

socket.addEventListener("close", () => console.log("closed"));
