import { make_pair, Pair } from "@common/structs";
import { Game } from "@server/game";

function main() {
  const wsUrl = "ws://localhost:3000/api/ws";
  const socket = new WebSocket(wsUrl);
  let username = "";

  socket.onopen = () => {
    socket.send(JSON.stringify({ action: "fetch" }));
    socket.send(JSON.stringify({ action: "getinfo" }));
  };

  socket.onmessage = raw => {
    const data = JSON.parse(raw.data + "");
    const { action } = data;

    if (action === "info") {
      username = data.username;

      updateRatingChanges(data.ratingChanges ?? make_pair(0, 0));
    } else if (action == "update") {
      update(data as Game);
    }
  };

  function updateRatingChanges(changes: Pair<number, number>) {
    document.getElementById("rating-win")!.innerText = "+" + changes.first.toString();
    document.getElementById("rating-lose")!.innerText = changes.second.toString();
    document.getElementById("rating-change")!.hidden = false;
  }

  function winner(game: Game) {
    if (game.score.first === 2) {
      return 0;
    } else if (game.score.second == 2) {
      return 1;
    }

    return -1;
  }

  function update(game: Game) {
    document.getElementById("round-display")!.innerText = `Round #${game.round}`;

    const score = game.score;

    if (game.players[0] === username) {
      document.getElementById("pscore1")!.innerText = score.first.toString();
      document.getElementById("pscore2")!.innerText = score.second.toString();
    } else {
      document.getElementById("pscore2")!.innerText = score.first.toString();
      document.getElementById("pscore1")!.innerText = score.second.toString();
    }

    document.getElementById("problem-content")!.innerText = `$$${game.problem} dx $$`;

    if (winner(game) > -1) {
      socket.close();

      document.getElementById("winner")!.innerText = `Winner: ${game.players[winner(game)]}!`;

      document.getElementById("game-result")!.hidden = false;
    }
  }

  function sendAnswer() {
    const input = document.getElementById("answer-input") as HTMLInputElement;

    socket.send(JSON.stringify({ action: "submit", answer: input.value }));
  }

  document.getElementById("answer-form")?.addEventListener("submit", e => {
    e.preventDefault();

    sendAnswer();
  });
}

main();
