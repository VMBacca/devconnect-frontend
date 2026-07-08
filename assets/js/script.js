document.addEventListener("DOMContentLoaded", init);

const state = {
  user: null,
  posts: [],
};

const newPostState = {
  mode: "closed",
};

if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

async function init() {
  await loadUser();
  await loadFeed();

  setupTabs();
  setupNewPost();
  setupSearch();

  setupLogout();
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-item");

  if (!tabs.length) return;

  showTab();

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      setActiveTab(e.target.getAttribute("data-for"));
      showTab();
    });
  });
}

function renderFeed() {
  const container = document.getElementById("feed-container");

  if (!container) return;

  const editor = document.querySelector(".feed-new");

  container.innerHTML = "";

  if (editor) {
    container.appendChild(editor);
    setupNewPost();
  }

  if (state.posts.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `
            <div class="box">
                <div class="box-body">
                    No posts found.
                </div>
            </div>
            `,
    );

    return;
  }

  state.posts.forEach((post) => {
    container.insertAdjacentHTML(
      "beforeend",
      renderPost(post, state.user.avatar),
    );
  });
}

function getPostImage(post) {
  if (post.type !== "photo") {
    return "";
  }

  return `
        <div class="feed-item-photo">
            <img src="${post.body}">
        </div>
    `;
}

function updateSidebarCounter() {
  const badge = document.getElementById("friend-count");

  if (!badge || !state.user) return;

  badge.innerText = state.user.followers;
}

function renderComments(post) {
  let html = "";

  post.comments.forEach((comment) => {
    html += `
            <div class="row mb-10">

                <div class="fic-item-photo">
                    <img src="${comment.user.avatar}">
                </div>

                <div class="fic-item-info">
                    <a href="profile.html?id=${comment.user.id}">
                        ${comment.user.name}
                    </a>

                    ${comment.body}
                </div>

            </div>
        `;
  });

  return html;
}

function renderPost(post, loggedUserAvatar) {
  const heart = post.liked
    ? "assets/images/heart-on.png"
    : "assets/images/heart-off.png";

  return `
        <div class="box feed-item">
            <div class="box-body">
                <div class="feed-item-head row">
                  <div class="feed-item-avatar">
                      <img
                          class="feed-avatar-img"
                          src="${post.user.avatar}">
                  </div>
                  <div class="feed-item-info">
                      <div class="feed-item-name">
                          <a href="profile.html?id=${post.user.id}">
                              ${post.user.name}
                          </a>
                      </div>
                      <div class="feed-item-date">
                          ${timeAgo(post.created_at)}
                      </div>
                  </div>
                  ${
                    post.mine
                      ? `
                          <div class="post-menu">
                              <button
                                  class="post-menu-btn"
                                  onclick="togglePostMenu(${post.id})">
                                  ⋮
                              </button>
                              <div
                                  id="post-menu-${post.id}"
                                  class="post-menu-box">
                                  <div onclick="deletePost(${post.id})">
                                      Delete Post
                                  </div>
                              </div>
                          </div>
                          `
                      : ""
                  }
              </div>
                <div class="feed-item-body">
                    ${post.type === "text" ? post.body : ""}
                    ${getPostImage(post)}
                </div>
                <div class="feed-item-buttons">
                    <div
                        class="like-btn ${post.liked ? "on" : ""}"
                        onclick="toggleLike(${post.id})">
                        ${post.likeCount}
                    </div>
                    <div class="msg-btn">
                        ${post.comments.length}
                    </div>
                </div>
                <div class="feed-item-comments">
                    ${renderComments(post)}
                    <div class="row">
                        <div class="fic-item-photo">
                            <img src="${state.user.avatar}">
                        </div>
                        <div class="fic-item-info" style="flex:1">
                            <input
                                id="comment-${post.id}"
                                class="fic-item-field"
                                type="text"
                                placeholder="Write a comment..."
                                onkeydown="handleCommentKey(event, ${post.id})">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
}

async function loadUser() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://127.0.0.1:8000/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  state.user = data.data;

  localStorage.setItem("devconnect_user", JSON.stringify(state.user));

  renderUser();
}

async function loadFeed() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://127.0.0.1:8000/api/feed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  state.posts = data.posts || [];

  renderFeed();
}

function renderUser() {
  const name = document.getElementById("current-user-name");
  const avatar = document.getElementById("current-user-avatar");
  const feedAvatar = document.getElementById("create-post-avatar");
  const placeholder = document.getElementById("create-post-placeholder");

  if (name) name.innerText = state.user.name;
  if (avatar) avatar.src = state.user.avatar;
  if (feedAvatar) feedAvatar.src = state.user.avatar;

  if (placeholder) {
    placeholder.innerText = `What's on your mind, ${state.user.name}?`;
  }

  updateSidebarCounter();
}

function openPostEditor() {
  const placeholder = document.getElementById("create-post-placeholder");
  const input = document.getElementById("create-post-input");
  const send = document.getElementById("create-post-button");

  if (!placeholder || !input || !send) return;

  placeholder.style.display = "none";
  input.style.display = "block";
  send.style.display = "flex";

  input.focus();

  newPostState.mode = "open";
}

function closePostEditor() {
  const placeholder = document.getElementById("create-post-placeholder");
  const input = document.getElementById("create-post-input");
  const send = document.getElementById("create-post-button");

  if (!placeholder || !input || !send) return;

  input.innerHTML = "";

  input.style.display = "none";
  send.style.display = "none";
  placeholder.style.display = "block";

  newPostState.mode = "closed";
}

function setupNewPost() {
  const placeholder = document.getElementById("create-post-placeholder");
  const input = document.getElementById("create-post-input");
  const send = document.getElementById("create-post-button");

  if (!placeholder || !input || !send) return;

  placeholder.addEventListener("click", openPostEditor);

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (input.innerText.trim() === "") {
        closePostEditor();
      }
    }, 200);
  });

  send.addEventListener("click", createPost);
}

async function createPost() {
  const input = document.getElementById("create-post-input");

  if (!input) return;

  const text = input.innerText.trim();

  if (text === "") return;

  const formData = new FormData();

  formData.append("type", "text");
  formData.append("body", text);

  const response = await fetch("http://127.0.0.1:8000/api/feed", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },

    body: formData,
  });

  const json = await response.json();

  if (json.error !== "") {
    alert(json.error);
    return;
  }

  closePostEditor();

  await loadFeed();
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

function setActiveTab(tab) {
  document.querySelectorAll(".tab-item").forEach((e) => {
    e.classList.toggle("active", e.getAttribute("data-for") === tab);
  });
}

function showTab() {
  const active = document.querySelector(".tab-item.active");
  if (!active) return;

  const tab = active.getAttribute("data-for");

  document.querySelectorAll(".tab-body").forEach((e) => {
    e.style.display = e.getAttribute("data-item") === tab ? "block" : "none";
  });
}
async function toggleLike(id) {
  const response = await fetch(`http://127.0.0.1:8000/api/post/${id}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const json = await response.json();

  if (json.error !== "") {
    alert(json.error);
    return;
  }

  if (document.getElementById("feed-container")) {
    await loadFeed();
  } else if (document.getElementById("profile-posts")) {
    await loadProfile();
  }
}

async function handleCommentKey(event, id) {
  if (event.key !== "Enter") return;

  const input = document.getElementById(`comment-${id}`);

  const body = input.value.trim();

  if (body === "") return;

  const formData = new FormData();

  formData.append("body", body);

  const response = await fetch(
    `http://127.0.0.1:8000/api/post/${id}/comment`,

    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: formData,
    },
  );

  const json = await response.json();

  if (json.error !== "") {
    alert(json.error);

    return;
  }

  input.value = "";

  if (document.getElementById("feed-container")) {
    await loadFeed();
  } else if (document.getElementById("profile-posts")) {
    await loadProfile();
  }
}

async function sendPost() {
  const editor = document.getElementById("create-post-input");

  const body = editor.innerText.trim();

  if (body === "") return;

  const formData = new FormData();

  formData.append("type", "text");

  formData.append("body", body);

  const response = await fetch(
    "http://127.0.0.1:8000/api/feed",

    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: formData,
    },
  );

  const json = await response.json();

  if (json.error !== "") {
    alert(json.error);

    return;
  }

  editor.innerHTML = "";

  await loadFeed();
}

function togglePostMenu(postId) {
  const menu = document.getElementById(`post-menu-${postId}`);

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    document.querySelectorAll(".post-menu-box").forEach((item) => {
      item.style.display = "none";
    });

    menu.style.display = "block";
  }
}

async function deletePost(postId) {
  if (!confirm("Delete this post?")) {
    return;
  }

  await fetch(`http://127.0.0.1:8000/api/post/${postId}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  loadFeed();
}

function setupSearch() {
  const form = document.querySelector(".search-area form");

  if (!form) return;

  form.addEventListener("submit", searchUser);
}

async function searchUser(event) {
  event.preventDefault();

  const input = document.querySelector(".search-area input");

  const text = input.value.trim();

  if (text === "") return;

  const response = await fetch(
    `http://127.0.0.1:8000/api/search?txt=${encodeURIComponent(text)}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const json = await response.json();

  if (json.error !== "") {
    alert(json.error);
    return;
  }

  if (json.users.length === 0) {
    alert("User not found.");
    return;
  }

  window.location.href = `profile.html?id=${json.users[0].id}`;
}
