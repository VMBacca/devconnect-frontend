const API_URL = "http://127.0.0.1:8000/api";

document.querySelector("#signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("[name=name]").value;

  const email = document.querySelector("[name=email]").value;

  const password = document.querySelector("[name=password]").value;

  const birthdate = document.querySelector("[name=birthdate]").value;

  const avatarStyle = document.querySelector(
    "[name=avatarStyle]:checked",
  ).value;

  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        birthdate,
        avatarStyle,
      }),
    });

    const data = await response.json();

    if (data.error === "") {
      localStorage.setItem("token", data.token);

      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
  }
});
