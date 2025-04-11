window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});
function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function navigateTo(page) {
  if (page) {
    window.location.href = page;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".masonry-grid");
  const gridItems = document.querySelectorAll(".grid-item");

  // Lazy-load observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  gridItems.forEach(item => observer.observe(item));

  // Wait until images are loaded, then Masonry
  imagesLoaded(grid, () => {
    new Masonry(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-item",
      gutter: 10,
      percentPosition: true
    });
  });
});
// Subtle Parallax Effect on Scroll
window.addEventListener('scroll', () => {
  document.querySelectorAll('.grid-item.parallax').forEach(item => {
    const rect = item.getBoundingClientRect();
    const offset = rect.top * 0.05; // adjust multiplier for intensity
    item.style.transform = `translateY(${offset}px)`;
  });
});