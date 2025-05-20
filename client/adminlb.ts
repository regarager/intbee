import { LBPartial, LBParticipant } from "@util/common";

const tbody = document.getElementById("tbody")!;
const wsUrl = "ws://localhost:3000/lb";

const socket = new WebSocket(wsUrl);
const score = [5, 5, 5, 5, 5, 8, 8, 8, 8, 8, 11, 11, 11, 11, 11, 15, 15];

function getScore(participant: LBParticipant): number {
  let ans = 0;
  for (let i = 0; i < participant.attempts.length; i++) {
    ans += participant.attempts[i] > 0 ? score[i] : 0;
  }
  return ans;
}

function makeOfficialToggleButton(name: string, id: number): HTMLButtonElement {
  const btn = document.createElement("button");

  btn.innerText = name;

  btn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "admin-toggle-official",
        id: id,
      }),
    );
  };

  return btn;
}

function makeButtons(participantId: number, questionIndex: number): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "cell-btns";
  const correctBtn = document.createElement("button");

  correctBtn.textContent = "✓";
  correctBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "admin-correct",
        id: participantId,
        question: questionIndex,
      }),
    );
  };

  const wrongBtn = document.createElement("button");
  wrongBtn.textContent = "✗";
  wrongBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "admin-wrong",
        id: participantId,
        question: questionIndex,
      }),
    );
  };

  const undoBtn = document.createElement("button");
  undoBtn.textContent = "↩";
  undoBtn.onclick = () => {
    socket.send(
      JSON.stringify({
        action: "admin-undo",
        id: participantId,
        question: questionIndex,
      }),
    );
  };

  container.appendChild(correctBtn);
  container.appendChild(wrongBtn);
  container.appendChild(undoBtn);

  return container;
}

function updateAdminTable(data: LBParticipant[]) {
  // data = data.sort((a, b) => getScore(b) - getScore(a));
  tbody.innerHTML = "";

  for (const participant of data) {
    const tr = document.createElement("tr");

    const idCell = document.createElement("td");
    idCell.textContent = participant.id.toString();
    tr.appendChild(idCell);

    const nameCell = document.createElement("td");
    nameCell.appendChild(makeOfficialToggleButton(participant.name, participant.id));
    nameCell.style.backgroundColor = "white";

    tr.appendChild(nameCell);

    const ptsCell = document.createElement("td");
    ptsCell.textContent = getScore(participant).toString();
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
  socket.send(JSON.stringify({ action: "data" }));
});

socket.addEventListener("message", ev => {
  console.log("updated");
  const content = ev.data + "";
  const data = JSON.parse(content) as LBPartial;
  updateAdminTable(data.participants);
});

socket.addEventListener("close", () => console.log("Admin disconnected"));

document.getElementById("form")!.addEventListener("submit", e => {
  const nameInput = document.getElementById("name-input") as HTMLInputElement;
  const actionInput = document.getElementById("action-input") as HTMLSelectElement;

  e.preventDefault();

  const action = actionInput.value;
  console.log(action);
  const obj: any = { action: `admin-${action}` };

  if (action === "add") {
    obj.name = nameInput.value;
  } else if (action === "remove") {
    obj.id = nameInput.value;
  }

  socket.send(JSON.stringify(obj));
});

document.getElementById("save")!.addEventListener("click", () => {
  socket.send(JSON.stringify({ action: "admin-save" }));
});

document.getElementById("load")!.addEventListener("click", () => {
  socket.send(JSON.stringify({ action: "admin-load" }));
});
