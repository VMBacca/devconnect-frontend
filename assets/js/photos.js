document.addEventListener("DOMContentLoaded", init);

const photosState = {
  user: null,
  photos: [],
};

async function init() {
  await loadPhotos();

  setupPhotoPreview();
  setupCancelPhoto();
  setupPhotoUpload();
  setupPhotoModal();
  setupLogout();
}

async function loadPhotos() {
  const token = localStorage.getItem("token");

  const userResponse = await fetch("http://127.0.0.1:8000/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const userData = await userResponse.json();

  photosState.user = userData.data;

  const photosResponse = await fetch("http://127.0.0.1:8000/api/user/photos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const photosData = await photosResponse.json();

  photosState.photos = photosData.posts;

  renderHeader();
  renderProfile();
  renderPhotos();
  updateSidebarCounter();
}

function renderHeader() {
  document.getElementById("logged-user-name").innerText = photosState.user.name;

  document.getElementById("logged-user-avatar").src = photosState.user.avatar;
}

function renderProfile() {
  document.getElementById("photos-cover").style.backgroundImage =
    `url('${photosState.user.cover}')`;

  document.getElementById("photos-avatar").src = photosState.user.avatar;

  document.getElementById("photos-name").innerText = photosState.user.name;

  document.getElementById("photos-name").href =
    `profile.html?id=${photosState.user.id}`;

  document.getElementById("photos-city").innerText =
    photosState.user.city || "City not specified";

  document.getElementById("photos-followers").innerText =
    photosState.user.followers;

  document.getElementById("photos-following").innerText =
    photosState.user.following;

  document.getElementById("photos-count").innerText =
    photosState.user.photoCount;

  document.getElementById("photos-title").innerText =
    `Gallery (${photosState.user.photoCount})`;

  document.getElementById("photos-subtitle").innerText =
    `All photos published by ${photosState.user.name}`;
}

function renderPhotos() {
  const container = document.getElementById("photos-container");

  container.innerHTML = "";

  if (!photosState.photos.length) {
    container.innerHTML = `<div style="padding:20px;text-align:center">
            No photos published.
        </div>`;

    return;
  }

  photosState.photos.forEach((photo) => {
    container.insertAdjacentHTML(
      "beforeend",
      `

            <div class="user-photo-item">

                <img
                    class="gallery-photo"
                    src="${photo.body}"
                    data-url="${photo.body}"
                >

            </div>

        `,
    );
  });

  document.querySelectorAll(".gallery-photo").forEach((img) => {
    img.onclick = () => {
      document.getElementById("modal-photo").src = img.dataset.url;

      document.getElementById("photo-modal").classList.add("active");
    };
  });
}

function updateSidebarCounter() {
  const badge = document.getElementById("friends-count");

  if (!badge || !state.user) return;

  badge.innerText = state.user.followers;
}

function setupPhotoUpload() {
  const button = document.getElementById("upload-photo-btn");

  if (!button) return;

  button.addEventListener("click", uploadPhoto);
}

async function uploadPhoto() {
  const fileInput = document.getElementById("photo-upload");

  if (fileInput.files.length === 0) {
    alert("Select a photo.");
    return;
  }

  const formData = new FormData();

  formData.append("type", "photo");
  formData.append("photo", fileInput.files[0]);

  const response = await fetch("http://127.0.0.1:8000/api/feed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (data.error !== "") {
    alert(data.error);
    return;
  }

  fileInput.value = "";

  document.getElementById("photo-preview-area").innerHTML = "";

  await loadPhotos();

  alert("Photo successfully sent!");
}

function setupPhotoPreview() {
  const input = document.getElementById("photo-upload");

  if (!input) return;

  input.addEventListener("change", () => {
    const previewArea = document.getElementById("photo-preview-area");
    const cancelBtn = document.getElementById("cancel-photo-btn");

    previewArea.innerHTML = "";

    if (!input.files.length) {
      cancelBtn.style.display = "none";
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      previewArea.innerHTML = `
        <img
            src="${e.target.result}"
            style="
                max-width:300px;
                border-radius:8px;
                margin-top:10px;
            ">
    `;

      cancelBtn.style.display = "inline-block";
    };

    reader.readAsDataURL(file);
  });
}

function setupCancelPhoto() {
  const cancelBtn = document.getElementById("cancel-photo-btn");

  const input = document.getElementById("photo-upload");

  const previewArea = document.getElementById("photo-preview-area");

  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    input.value = "";

    previewArea.innerHTML = "";

    cancelBtn.style.display = "none";
  });
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

function setupPhotoModal() {
  const modal = document.getElementById("photo-modal");

  if (!modal) return;

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.getAttribute("rel") === "modal:close") {
      modal.classList.remove("active");
    }
  });
}
