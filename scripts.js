function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function navigateTo(page) {
  if (page) {
    window.location.href = page;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".masonry-grid");
  imagesLoaded(grid, function () {
    new Masonry(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-item", // Use one of your items as size reference
      gutter: 16,
      percentPosition: true,
      fitWidth: true
    });
  });
});

// Only enable this on mobile
if (window.innerWidth <= 768) {
  document.querySelectorAll('.image-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      // Toggle the active state
      wrapper.classList.toggle('active');
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const frames = document.querySelectorAll(".grid-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    {
      threshold: 0.2 // Trigger when 20% of frame is visible
    }
  );

  frames.forEach(frame => {
    observer.observe(frame);
  });
});
frames.forEach((frame, index) => {
  frame.style.transitionDelay = `${index * 100}ms`;
  observer.observe(frame);
});
  
  