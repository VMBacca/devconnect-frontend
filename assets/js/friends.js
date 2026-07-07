document.addEventListener("DOMContentLoaded", init);

const friendsState = {
  user: null,
  followers: [],
  following: [],
};

async function init() {
  await loadFriends();
  setupTabs();
  setupLogout();
}

async function loadFriends() {
  const token = localStorage.getItem("token");

  const userResponse = await fetch("http://127.0.0.1:8000/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const userData = await userResponse.json();
  friendsState.user = userData.data;

  const friendsResponse = await fetch(
    `http://127.0.0.1:8000/api/user/${friendsState.user.id}/followers`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const friendsData = await friendsResponse.json();

  friendsState.followers = friendsData.followers || [];
  friendsState.following = friendsData.following || [];

  renderFriends();
  renderHeader();
  renderProfileInfo();
  updateSidebarCounter();
  updateCounters();
}

function renderFriends() {
  const followersContainer = document.getElementById("followers-list");
  const followingContainer = document.getElementById("following-list");

  if (!followersContainer || !followingContainer) return;

  followersContainer.innerHTML = "";
  followingContainer.innerHTML = "";

  friendsState.followers.forEach((user) => {
    followersContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="friend-icon" data-userid="${user.id}">
        <div class="friend-icon-avatar">
          <img src="${user.avatar}" />
        </div>
        <div class="friend-icon-name">${user.name}</div>
      </div>
      `,
    );
  });

  friendsState.following.forEach((user) => {
    followingContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="friend-icon" data-userid="${user.id}">
        <div class="friend-icon-avatar">
          <img src="${user.avatar}" />
        </div>
        <div class="friend-icon-name">${user.name}</div>
      </div>
      `,
    );
  });

  document.querySelectorAll(".friend-icon").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.userid;
      if (id) window.location.href = `profile.html?id=${id}`;
    });
  });
}

function updateCounters() {
  const followersTotal = document.getElementById("followers-total");
  const followingTotal = document.getElementById("following-total");

  if (followersTotal) {
    followersTotal.innerText = `(${friendsState.followers.length})`;
  }

  if (followingTotal) {
    followingTotal.innerText = `(${friendsState.following.length})`;
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-item");
  const bodies = document.querySelectorAll(".tab-body");

  if (!tabs.length || !bodies.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-for");

      tabs.forEach((t) => t.classList.remove("active"));
      bodies.forEach((b) => b.classList.remove("active"));

      tab.classList.add("active");

      const activeBody = document.querySelector(`[data-item="${target}"]`);
      if (activeBody) activeBody.classList.add("active");
    });
  });
}

function renderHeader() {
  const name = document.getElementById("logged-user-name");
  const avatar = document.getElementById("logged-user-avatar");

  if (!friendsState.user) {
    return;
  }

  if (name) {
    name.innerText = friendsState.user.name;
  }

  if (avatar) {
    avatar.src = friendsState.user.avatar;
  }
}

function renderProfileInfo() {
  document.getElementById("friends-avatar").src = friendsState.user.avatar;

  document.getElementById("friends-name").innerText = friendsState.user.name;

  document.getElementById("friends-city").innerText =
    friendsState.user.city || "City not specified";

  document.getElementById("friends-followers").innerText =
    friendsState.user.followers;

  document.getElementById("friends-following").innerText =
    friendsState.user.following;

  document.getElementById("friends-photos").innerText =
    friendsState.user.photoCount;

  document.getElementById("friends-cover").style.backgroundImage =
    `url('${friendsState.user.cover}')`;
}

function updateSidebarCounter() {
  const badge = document.getElementById("friends-count");

  if (!badge || !friendsState?.user) return;

  badge.innerText = friendsState.user.followers;
}

function setupLogout() {
  [
    document.getElementById("logout-btn"),
    document.getElementById("logout-btn-side"),
  ].forEach((btn) => {
    if (!btn) return;

    btn.onclick = (e) => {
      e.preventDefault();

      localStorage.removeItem("token");

      location.href = "login.html";
    };
  });
}
