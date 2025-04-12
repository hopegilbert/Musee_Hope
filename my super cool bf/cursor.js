document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById("cursor");

  let mouseX = 0;
  let mouseY = 0;
  let isInside = true;

  // Smooth cursor movement
  function updateCursor() {
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    requestAnimationFrame(updateCursor);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isInside) {
      cursor.style.opacity = "1";
      isInside = true;
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    isInside = false;
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
    isInside = true;
  });

  updateCursor();
});

document.addEventListener('mousemove', (e) => {
  const cursor = document.getElementById('cursor');
  const { clientX, clientY } = e;
  const withinX = clientX >= 0 && clientX <= window.innerWidth;
  const withinY = clientY >= 0 && clientY <= window.innerHeight;

  if (cursor) {
    if (!withinX || !withinY) {
      cursor.classList.add('cursor-hidden');
    } else {
      cursor.classList.remove('cursor-hidden');
    }
  }
}); 