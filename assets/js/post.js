function renderPost(post, loggedUserAvatar) {
  return `

    <div class="box feed-item">

      <div class="box-body">

        <div class="feed-item-head row mt-20 m-width-20">

          <div class="feed-item-head-photo">
            <a href="profile.html?id=${post.user.id}">
              <img src="${post.user.avatar}">
            </a>
          </div>

          <div class="feed-item-head-info">

            <a href="profile.html?id=${post.user.id}">
              <span class="fidi-name">
                ${post.user.name}
              </span>
            </a>

            <span class="fidi-action">
              ${post.type === "photo" ? "posted a photo" : "posted"}
            </span>

            <br>

            <span class="fidi-date">
              ${timeAgo(post.created_at)}
              
            </span>

          </div>

        </div>

        <div class="feed-item-body mt-10 m-width-20">

          ${
            post.type === "photo"
              ? `<img src="${post.body}" style="max-width:100%">`
              : post.body
          }

        </div>

        <div class="feed-item-buttons row mt-20 m-width-20">

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

          ${post.comments
            .map(
              (comment) => `
                <div class="row mt-20">

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
              `,
            )
            .join("")}

        </div>

        <div class="feed-item-comments">

          <div class="row mt-20">

            <div class="fic-item-photo">
              <img src="${loggedUserAvatar}">
            </div>

            <input
              type="text"
              class="fic-item-field"
              id="comment-input-${post.id}"
              onkeydown="handleCommentKey(event, ${post.id})"
              placeholder="Escreva um comentário">

          </div>

        </div>

      </div>

    </div>

  `;
}

function timeAgo(dateString) {
  const now = new Date();

  const post = new Date(dateString.replace(" ", "T"));

  const seconds = Math.floor((now - post) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} minutes ago`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} hours ago`;
  }

  if (seconds < 172800) {
    return "Yesterday";
  }

  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  return post.toLocaleDateString();
}
