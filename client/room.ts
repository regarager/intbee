import { Game } from "@server/game";

function main() {
  const wsUrl = "ws://localhost:3000/api/ws";
  const socket = new WebSocket(wsUrl);
  let username = "";

  socket.onmessage = raw => {
    const data = JSON.parse(raw.data + "");

    if (data.username) {
      username = data.username;
    } else update(JSON.parse(data.data + "") as Game);
  };

  function update(game: Game) {
    document.getElementById("game-round")!.innerText = `Round ${game.round}`;

    const score = game.score;

    if (game.players[0] === username) {
      document.getElementById("pscore1")!.innerText = score.first.toString();
      document.getElementById("pscore2")!.innerText = score.second.toString();
    } else {
      document.getElementById("pscore2")!.innerText = score.first.toString();
      document.getElementById("pscore1")!.innerText = score.second.toString();
    }
  }

  function sendAnswer() {
    const input = document.getElementById("answer-input") as HTMLInputElement;

    socket.send(JSON.stringify({ action: "submit", answer: input.value }));
  }

  document.getElementById("answer")?.addEventListener("submit", e => {
    e.preventDefault();

    sendAnswer();
  });
}

main();
