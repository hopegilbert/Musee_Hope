function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function navigateTo(page) {
  if (page) {
    window.location.href = page;
  }
}

// Image tap support for hover text (mobile only)
if (window.innerWidth <= 768) {
  document.querySelectorAll('.image-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      wrapper.classList.toggle('active');
    });
  });
}

// Animate frames on scroll
document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".masonry-grid");

  // Wait for all images to load before Masonry
  imagesLoaded(grid, function () {
    new Masonry(grid, {
      itemSelector: ".grid-item",
      gutter: 16,
      fitWidth: true,
      percentPosition: true,
    });

    // Reveal each image using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    const items = document.querySelectorAll(".grid-item");
    items.forEach((item) => {
      observer.observe(item);
    });
  });
});