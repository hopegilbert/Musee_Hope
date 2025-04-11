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

// Custom cursor
document.addEventListener('DOMContentLoaded', () => {
  // Create cursor element if it doesn't exist
  let cursor = document.getElementById('cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'cursor';
    document.body.appendChild(cursor);
  }
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Scale effect when clicking
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Create sparkle trail
  const trailCount = 15;
  const sparkles = [];

  for (let i = 0; i < trailCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);
    sparkles.push(sparkle);
  }

  document.addEventListener("mousemove", (e) => {
    let i = 0;
    function animate() {
      if (i >= sparkles.length) return;
      const sparkle = sparkles[i];
      sparkle.style.left = `${e.pageX}px`;
      sparkle.style.top = `${e.pageY}px`;
      sparkle.style.opacity = 1;
      sparkle.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      sparkle.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(0.5)`;
      setTimeout(() => sparkle.style.opacity = 0, 10);
      i++;
      requestAnimationFrame(animate);
    }
    animate();
  });
});
