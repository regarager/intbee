import { LBPartial, LBParticipant } from "@util/common";

const tbody = document.getElementById("tbody")!;
const wsUrl = "ws://localhost:3000/lb";
const { id } = (document.querySelector(".container") as HTMLDivElement).dataset!;

const socket = new WebSocket(wsUrl);

// get score of participant
function getScore(score: number[], participant: LBParticipant): number {
  let ans = 0;
  for (let i = 0; i < participant.attempts.length; i++) {
    ans += participant.attempts[i] > 0 ? score[i] : 0;
  }
  return ans;
}

// makes buttons for admin console
function makeButtons(participantId: number, questionIndex: number): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "cell-btns";
  const correctBtn = document.createElement("button");

  correctBtn.textContent = "✓";
  correctBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "correct",
        participantId,
        question: questionIndex,
        id,
      }),
    );
  };

  const wrongBtn = document.createElement("button");
  wrongBtn.textContent = "✗";
  wrongBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "incorrect",
        participantId,
        question: questionIndex,
        id,
      }),
    );
  };

  const undoBtn = document.createElement("button");
  undoBtn.textContent = "↩";
  undoBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "undo",
        participantId,
        question: questionIndex,
        id,
      }),
    );
  };

  container.appendChild(correctBtn);
  container.appendChild(wrongBtn);
  container.appendChild(undoBtn);

  return container;
}

// update leaderboard for admin
function updateAdminTable(data: LBPartial) {
  // data = data.sort((a, b) => getScore(b) - getScore(a));
  tbody.innerHTML = "";

  for (const participant of data.participants) {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = participant.id.toString();
    tr.appendChild(idCell);

    const nameCell = document.createElement("td");
    nameCell.style.backgroundColor = "white";
    nameCell.innerText = participant.name;

    tr.appendChild(nameCell);

    const ptsCell = document.createElement("td");
    ptsCell.textContent = getScore(data.score_values, participant).toString();
    tr.appendChild(ptsCell);

    const subCell = document.createElement("td");
    subCell.textContent = participant.attempts
      .reduce((prev, curr) => prev + Math.abs(curr))
      .toString();
    tr.appendChild(subCell);

    participant.attempts.forEach((attempt, index) => {
      const problemCell = document.createElement("td");
      problemCell.className = attempt === 0 ? "unattempted" : attempt > 0 ? "correct" : "wrong";

      const attemptDisplay = document.createElement("span");
      attemptDisplay.textContent = Math.abs(attempt).toString();
      problemCell.appendChild(attemptDisplay);

      problemCell.appendChild(makeButtons(participant.id, index));
      tr.appendChild(problemCell);
    });

    tbody.appendChild(tr);
  }
}

// WebSocket event handlers
socket.addEventListener("open", () => {
  console.log("Admin connected");
  socket.send(JSON.stringify({ action: "data", id }));
});

socket.addEventListener("message", ev => {
  console.log("updated");
  const content = ev.data + "";
  const data = JSON.parse(content) as LBPartial;
  updateAdminTable(data);
});

socket.addEventListener("close", () => console.log("Admin disconnected"));

// admin action on participant
document.getElementById("form")!.addEventListener("submit", e => {
  const nameInput = document.getElementById("name-input") as HTMLInputElement;
  const actionInput = document.getElementById("action-input") as HTMLSelectElement;

  e.preventDefault();

  const action = actionInput.value;
  const obj: any = { action: `user-${action}`, id };

  if (action === "add") {
    obj.name = nameInput.value;
  } else if (action === "remove") {
    obj.name = nameInput.value;
  }

  socket.send(JSON.stringify(obj));
});

document.getElementById("save")!.addEventListener("click", () => {
  socket.send(JSON.stringify({ action: "save", id }));
});

document.getElementById("load")!.addEventListener("click", () => {
  socket.send(JSON.stringify({ action: "load", id }));
});
