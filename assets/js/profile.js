document.addEventListener("DOMContentLoaded", init);

const profileState = {
  user: null,
  loggedUser: null,
};

async function init() {
  await loadProfile();
  setupLogout();
}

async function loadProfile() {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams(window.location.search);
  const profileId = params.get("id");

  const url = profileId
    ? `http://127.0.0.1:8000/api/user/${profileId}`
    : `http://127.0.0.1:8000/api/user`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  profileState.user = data.data;

  const currentUserResponse = await fetch("http://127.0.0.1:8000/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const currentUser = await currentUserResponse.json();

  profileState.loggedUser = currentUser.data;

  profileState.user.isOwner =
    profileState.loggedUser.id === profileState.user.id;

  updateProfileSidebarCounter();
  renderProfile();
}

function updateProfileSidebarCounter() {
  const badge = document.getElementById("friends-count");

  if (!badge || !profileState.loggedUser) return;

  badge.innerText = profileState.loggedUser.followers;
}

function renderProfile() {
  if (!profileState.user) return;

  const el = (id) => document.getElementById(id);

  el("profile-name").innerText = profileState.user.name;
  el("profile-city").innerText = profileState.user.city || "City not specified";

  el("followers-count").innerText = profileState.user.followers;
  el("following-count").innerText = profileState.user.following;
  el("photos-count").innerText = profileState.user.photoCount;

  const followingContainer = el("following-list");
  followingContainer.innerHTML = "";

  const followingList = profileState.user.followingList || [];

  if (followingList.length === 0) {
    followingContainer.innerHTML = `
      <div class="feed-item-body mt-10 m-width-20" style="width:100%; text-align:center;">
        Não segue ninguém ainda.
      </div>`;
  } else {
    followingList.forEach((friend) => {
      followingContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div class="friend-icon" data-userid="${friend.id}">
          <div class="friend-icon-avatar">
            <img src="${friend.avatar}">
          </div>
          <div class="friend-icon-name">
            ${friend.name}
          </div>
        </div>`,
      );
    });

    followingContainer.querySelectorAll(".friend-icon").forEach((card) => {
      card.addEventListener("click", () => {
        const userId = card.dataset.userid;
        if (userId) {
          window.location.href = `profile.html?id=${userId}`;
        }
      });
    });
  }

  el("following-total").innerText = `(${profileState.user.following})`;

  el("profile-avatar-main").src = profileState.user.avatar;
  el("header-avatar").src = profileState.user.avatar;
  el("header-user-name").innerText = profileState.user.name;

  el("profile-cover").style.backgroundImage =
    `url('${profileState.user.cover}')`;

  el("profile-city-full").innerText =
    profileState.user.city || "City not specified";

  el("profile-work").innerText =
    profileState.user.work || "Profession not specified";

  const birthElement = el("profile-birthdate");

  if (profileState.user.birthdate) {
    const birth = profileState.user.birthdate.split("-");
    birthElement.innerText = `${birth[2]}/${birth[1]}/${birth[0]} (${profileState.user.age} years)`;
  } else {
    birthElement.innerText = "Data não informada";
  }

  const photosContainer = el("profile-photos");
  photosContainer.innerHTML = "";

  if (profileState.user.photos.length === 0) {
    photosContainer.innerHTML = `
      <div class="feed-item-body mt-10 m-width-20" style="width:100%; text-align:center;">
        No photos published.
      </div>`;
  }

  profileState.user.photos.forEach((photo) => {
    photosContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div class="user-photo-item">
        <img
          class="gallery-photo"
          src="${photo.url}">
      </div>
    `,
    );
  });

  document.querySelectorAll("#profile-photos .gallery-photo").forEach((img) => {
    img.addEventListener("click", () => {
      document.getElementById("modal-photo").src = img.dataset.url;

      document.getElementById("photo-modal").classList.add("active");
    });
  });

  el("photos-box-count").innerText = `(${profileState.user.photoCount})`;

  renderProfilePosts();

  const followArea = el("follow-area");
  followArea.innerHTML = "";

  if (!profileState.user.me) {
    followArea.innerHTML = `
      <button
        id="follow-btn"
        class="${profileState.user.isFollowing ? "unfollow-btn" : "follow-btn"}"
        onclick="toggleFollow()">
        ${profileState.user.isFollowing ? "Deixar de seguir" : "Seguir"}
      </button>`;
  }

  if (profileState.user.isOwner) {
    setupAvatarUpload();
    setupCoverUpload();
  } else {
    const avatar = document.getElementById("profile-avatar-main");
    const cover = document.getElementById("profile-cover");

    avatar.onclick = null;
    cover.onclick = null;

    avatar.style.cursor = "default";
    cover.style.cursor = "default";

    avatar.style.pointerEvents = "none";
    cover.style.pointerEvents = "none";
  }
}

function renderProfilePosts() {
  const container = document.getElementById("profile-posts");

  container.innerHTML = "";

  if (!profileState.user.posts || profileState.user.posts.length === 0) {
    container.innerHTML = `
      <div class="box feed-item">
        <div class="box-body">
          <div class="feed-item-body mt-10 m-width-20" style="width:100%; text-align:center;">
            No posts published.
          </div>
        </div>
      </div>
    `;
    return;
  }

  profileState.user.posts.forEach((post) => {
    container.insertAdjacentHTML(
      "beforeend",
      renderPost(post, profileState.user.avatar),
    );
  });
}

async function toggleFollow() {
  const token = localStorage.getItem("token");

  await fetch(`http://127.0.0.1:8000/api/user/${profileState.user.id}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  loadProfile();
}

function getCurrentUser() {
  const user = localStorage.getItem("devconnect_user");
  return user ? JSON.parse(user) : null;
}

function setupAvatarUpload() {
  const avatar = document.getElementById("profile-avatar-main");

  const input = document.getElementById("avatar-upload");

  if (!avatar || !input) return;

  avatar.onclick = () => input.click();

  input.onchange = uploadAvatar;
}

async function uploadAvatar() {
  const input = document.getElementById("avatar-upload");

  if (!input.files.length) return;

  const formData = new FormData();
  formData.append("avatar", input.files[0]);

  const response = await fetch("http://127.0.0.1:8000/api/user/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const json = await response.json();

  if (json.error) {
    alert(json.error);
    return;
  }

  await loadProfile();
}

function setupCoverUpload() {
  const cover = document.getElementById("profile-cover");

  const input = document.getElementById("cover-upload");

  if (!cover || !input) return;

  cover.onclick = () => input.click();

  input.onchange = uploadCover;
}

async function uploadCover() {
  const input = document.getElementById("cover-upload");

  if (!input.files.length) return;

  const formData = new FormData();

  formData.append("cover", input.files[0]);

  const response = await fetch("http://127.0.0.1:8000/api/user/cover", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const json = await response.json();

  if (json.error) {
    alert(json.error);

    return;
  }

  await loadProfile();
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

function openPhotoModal(url) {
  document.getElementById("modal-photo").src = url;
  document.getElementById("photo-modal").classList.add("active");
}

function closePhotoModal() {
  document.getElementById("photo-modal").classList.remove("active");
}
