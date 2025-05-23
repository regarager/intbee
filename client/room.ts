import { DateTime } from "luxon";

import { RankedAction, GamePartial, action, log, RANKED_TIMER } from "@util/common";

function main() {
  const wsUrl = "ws://localhost:3000/ranked/ws/game";
  let timerHandle: NodeJS.Timeout;
  const lastRound = 0;

  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    log("Connected WS");
    socket.send(action(RankedAction.UPDATE, {}));
  };

  // parse data
  socket.onmessage = raw => {
    const data = JSON.parse(raw.data + "");

    update(data.data as GamePartial);
  };

  //updates game for player
  function update(game: GamePartial) {
    const { player } = game;

    document.getElementById("round-display")!.innerText = `Round #${game.round}`;

    const score = game.score;
    document.getElementById("pscore1")!.innerText = score[player].toString();
    document.getElementById("pscore2")!.innerText = score[1 - player].toString();

    // stop rerender after game complete
    if (game.winner === -2) {
      document.getElementById("problem-content")!.innerText = `$$${game.problem} \\mathop{dx} $$`;

      (window as any).MathJax.typesetPromise();
    }

    const progressBar = document.querySelector("#progress-bar") as HTMLSpanElement;
    const timer = document.querySelector("#timer") as HTMLElement;

    if (game.round > lastRound) {
      clearInterval(timerHandle);
    }

    // progress bar animation
    timerHandle = setInterval(() => {
      const curr = DateTime.now().toMillis();
      const delta = curr - game.roundEndTime + RANKED_TIMER * 1000;
      const completion = delta / (RANKED_TIMER * 1000);

      progressBar.style.width = `${Math.min(completion * 100, 100)}%`;

      const remaining = Math.max(Math.ceil((RANKED_TIMER * 1000 - delta) / 1000), 0);
      timer.innerText = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`;
    }, 50);

    if (game.winner === -1) {
      document.getElementById("winner")!.innerText = `Tied! No rating changes.`;
    } else if (game.winner > -1) {
      socket.close();

      document.getElementById("winner")!.innerText = `Winner: ${game.players[game.winner]}!`;
    }

    if (game.winner > -2) {
      document.getElementById("game-result")!.hidden = false;
    }
  }

  // submitting answer
  function sendAnswer() {
    const input = document.getElementById("answer-input") as HTMLInputElement;

    socket.send(action(RankedAction.SUBMIT, { answer: input.value }));
  }

  document.getElementById("answer-form")?.addEventListener("submit", e => {
    e.preventDefault();

    sendAnswer();
  });
}

window.onload = main;
