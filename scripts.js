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

// Custom cursor
document.addEventListener('DOMContentLoaded', () => {
  // Create cursor element if it doesn't exist
  let cursor = document.getElementById('cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'cursor';
    document.body.appendChild(cursor);
  }

  let lastX = 0;
  let lastY = 0;
  const sparkles = Array.from(document.querySelectorAll('.sparkle'));

  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    const insideViewport =
      x >= 0 && x <= window.innerWidth &&
      y >= 0 && y <= window.innerHeight;

    if (!insideViewport) {
      cursor.classList.add("hidden");
      sparkles.forEach(s => s.style.opacity = 0);
      return;
    }

    cursor.classList.remove("hidden");
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    // Animate sparkles trail
    let i = 0;
    function animateTrail() {
      if (i >= sparkles.length) return;
      const sparkle = sparkles[i];
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      sparkle.style.opacity = 1;
      sparkle.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      sparkle.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(0.5)`;
      setTimeout(() => (sparkle.style.opacity = 0), 10);
      i++;
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    lastX = x;
    lastY = y;
  });

  // Scale effect when clicking
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
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
