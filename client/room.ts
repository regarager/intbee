import { RankedAction, GamePartial, action, log } from "@util/common";

// need main function to avoid weird conflicts
function main() {
  const wsUrl = "ws://localhost:3000/ranked/ws/game";
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    log("Connected WS");
    socket.send(action(RankedAction.UPDATE, {}));
  };

  socket.onmessage = raw => {
    const data = JSON.parse(raw.data + "");
    const action: RankedAction = data.action;

    log(data);

    switch (action) {
      case RankedAction.UPDATE: {
        update(data.data as GamePartial);
        break;
      }
    }
  };

  function updateRatingChanges(player: number, ratingChanges: number[]) {
    document.getElementById("rating-win")!.innerText = "+" + ratingChanges[player].toString();
    document.getElementById("rating-lose")!.innerText = "-" + ratingChanges[1 - player].toString();
    document.getElementById("rating-change")!.hidden = false;
  }

  function update(game: GamePartial) {
    const { player } = game;

    updateRatingChanges(player, game.ratingChanges);
    document.getElementById("round-display")!.innerText = `Round #${game.round}`;

    const score = game.score;
    document.getElementById("pscore1")!.innerText = score[player].toString();
    document.getElementById("pscore2")!.innerText = score[1 - player].toString();

    document.getElementById("problem-content")!.innerText = `$$${game.problem} dx $$`;

    if (game.winner > -1) {
      socket.close();

      document.getElementById("winner")!.innerText = `Winner: ${game.players[game.winner]}!`;

      document.getElementById("game-result")!.hidden = false;
    }
  }

  function sendAnswer() {
    const input = document.getElementById("answer-input") as HTMLInputElement;

    socket.send(action(RankedAction.SUBMIT, { answer: input.value }));
  }

  document.getElementById("answer-form")?.addEventListener("submit", e => {
    e.preventDefault();

    sendAnswer();
  });
}

main();
