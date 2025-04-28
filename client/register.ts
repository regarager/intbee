const form = document.getElementById("login-form") as HTMLFormElement | null;
const authResult = document.getElementById("result");

form?.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(form);

  const body = Object.fromEntries(formData.entries());

  try {
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async res => {
      if (res.status !== 200) {
        throw new Error();
      }
    });

    if (authResult !== null) {
      authResult.hidden = false;
      authResult.innerText = "Successfully authenticated!";
      authResult.style.color = "green";
      window.location.href = "/gym";
    } else {
      alert("Successfully authenticated!");
    }
  } catch (err) {
    console.log(err);

    if (authResult !== null) {
      authResult.hidden = false;
      authResult.innerText = "Invalid username or password. (maybe try logging in?)";
      authResult.style.color = "red";
    } else {
      alert("Invalid username or password.");
    }
  }
});

// apparently theres some error if this line gets removed
export {};
