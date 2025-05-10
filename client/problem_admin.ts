import { ProblemPartial } from "@util/common";

let problem: ProblemPartial = {
  latex: "",
  answer: "",
  rating: 0,
  tags: [],
};

const problemDisplay = document.querySelector(".problem")! as HTMLDivElement;

document.getElementById("editor")!.addEventListener("input", e => {
  const target = e.target as HTMLInputElement;

  if (target.name === "integral") {
    problem.latex = target.value;
    problemDisplay.innerText = `$$${problem.latex}dx$$`;
  } else if (target.name === "answer") {
    problem.answer = target.value;
  } else if (target.name === "rating") {
    problem.rating = target.valueAsNumber;
  } else if (target.name === "tags") {
    problem.tags = target.value.split(",").map(s => s.trim().toLowerCase());
  }
});

document.getElementById("editor")!.addEventListener("submit", e => {
  e.preventDefault();

  fetch(window.location.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(problem),
  })
    .then(() => alert("Updated!"))
    .catch(() => alert("An error occurred"));
});

function getInput(name: string) {
  return document.getElementsByName(name)[0] as HTMLInputElement;
}

function loadProblem() {
  problem.latex = getInput("integral").attributes.getNamedItem("value")!.value;
  problem.answer = getInput("answer").attributes.getNamedItem("value")!.value;
  problem.rating = getInput("rating").valueAsNumber;
  problem.tags = getInput("tags")
    .value.split(",")
    .map(s => s.trim().toLowerCase());
}

loadProblem();
