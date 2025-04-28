const solBtn = document.getElementById("show-sol")!;

solBtn.addEventListener("click", () => {
  const state = document.getElementById("problem-solution")!.hidden;
  document.getElementById("problem-solution")!.hidden = !state;

  solBtn.innerText = `(click to ${state ? "hide" : "reveal"})`;
});

const form = document.getElementById("submission")!;

form.addEventListener("submit", async e => {
  e.preventDefault();

  let url = window.location.href;
  if (url.endsWith("?answer=")) url = url.slice(0, url.length - "?answer=".length);

  const id = url.slice(url.length - 24); // mongo id length

  await fetch(`/api/problem/${id}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latex: (document.getElementById("answer-input") as HTMLInputElement).value,
    }),
  })
    .then(res => res.json())
    .then(res => showResult(res.result));
});

function showResult(result: boolean) {
  const resElement = document.getElementById("result")!;

  resElement.hidden = false;

  if (result) {
    resElement.innerText = "Verdict: correct!";
    resElement.style = "color: green;";
  } else {
    resElement.innerText = "Verdict: incorrect";
    resElement.style = "color: red;";
  }
}
