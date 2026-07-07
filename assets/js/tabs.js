document.querySelectorAll(".tab-item").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab-item").forEach((item) => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".tab-body").forEach((body) => {
      body.classList.remove("active");
    });

    tab.classList.add("active");

    const target = document.querySelector(`[data-item="${tab.dataset.for}"]`);

    target.classList.add("active");
  });
});
