document.addEventListener("DOMContentLoaded", init);

const API_URL = "http://127.0.0.1:8000/api";

function init() {
  document.querySelector("form").addEventListener("submit", handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.querySelector("[name=email]").value;
  const password = document.querySelector("[name=password]").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
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
}
