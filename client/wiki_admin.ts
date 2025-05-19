import { TagType } from "@util/common";

const editor = document.querySelector("#editor") as HTMLTextAreaElement;

document.querySelector("#save-btn")!.addEventListener("click", async () => {
  let tag = editor.dataset.tag;

  if (tag === "") {
    console.log("tag not found");
    let resp = null;
    while (resp === null || !(resp as TagType)) {
      resp = prompt("Enter the tag: ");
    }

    tag = resp as TagType;
  } else {
    console.log("tag found: " + tag);
  }

  try {
    await fetch("/admin/wiki/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag,
        content: editor.value.trim(),
      }),
    });

    alert("Success!");
  } catch {
    alert("An error occurred");
  }
});
