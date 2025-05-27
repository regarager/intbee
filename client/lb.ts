import { LBPartial, LBParticipant } from "@util/common";

const tbody = document.getElementById("tbody")!;
const { id } = (document.querySelector(".container") as HTMLDivElement).dataset!;

const wsUrl = "ws://localhost:3000/lb";

const socket = new WebSocket(wsUrl);

// returns score of participant
function getScore(score: number[], participant: LBParticipant) {
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
function updateLeaderboard(data: LBPartial) {
  const { score_values } = data;

  const sorted_participants = data.participants.sort(
    (a, b) => getScore(score_values, b) - getScore(score_values, a),
  );

  tbody.innerHTML = "";

  let i = 0;

  const top_three = ["gold", "silver", "bronze"]; // colors

  for (const participant of sorted_participants) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    const name = document.createElement("td");
    id.innerText = participant.pid.toString();
    name.innerText = formatName(participant.name);

    if (i < 3) name.classList.add(top_three[i]);

    tr.append(id);
    tr.appendChild(name);

    const pts = document.createElement("td");
    pts.innerText = getScore(score_values, participant).toString();
    pts.style.color = "green";

    tr.appendChild(pts);

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
  updateLeaderboard(data);
});

socket.addEventListener("close", () => console.log("closed"));
