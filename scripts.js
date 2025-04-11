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
document.addEventListener("DOMContentLoaded", () => {
  const gridItems = document.querySelectorAll(".grid-item");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1
    }
  );

  gridItems.forEach(item => {
    observer.observe(item);
  });

  // Initialize Masonry after images are loaded
  const grid = document.querySelector(".masonry-grid");
  imagesLoaded(grid, function () {
    new Masonry(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-item",
      gutter: 10,
      percentPosition: true
    });
  });
});