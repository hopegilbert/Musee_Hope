function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function navigateTo(page) {
  if (page) {
    window.location.href = page;
  }
}

// Mobile support for showing hover-text on tap
if (window.innerWidth <= 768) {
  document.querySelectorAll('.image-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      wrapper.classList.toggle('active');
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".masonry-grid");
  const gridItems = document.querySelectorAll(".grid-item");

  // Ensure width and height are preserved
  document.querySelectorAll("img").forEach(img => {
    if (img.complete && img.naturalWidth) {
      img.setAttribute("width", img.naturalWidth);
      img.setAttribute("height", img.naturalHeight);
    }
  });

  imagesLoaded(grid, () => {
    // Now initialize Masonry
    const msnry = new Masonry(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-item",
      gutter: 10,
      percentPosition: true
    });

    // Delay animations to allow layout to stabilize
    setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target);
              msnry.layout();
            }
          });
        },
        { threshold: 0.1 }
      );

      gridItems.forEach(item => observer.observe(item));
    }, 300);
  });
});