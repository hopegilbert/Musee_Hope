document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  let mouseX = 0;
  let mouseY = 0;

  // Position cursor and hide when outside window
  function updateCursor() {
    const inViewport =
      mouseX >= 0 &&
      mouseY >= 0 &&
      mouseX <= window.innerWidth &&
      mouseY <= window.innerHeight;

    if (inViewport) {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate(-50%, -50%) translate(${mouseX}px, ${mouseY}px)`;
    } else {
      cursor.style.opacity = '0';
    }

    requestAnimationFrame(updateCursor);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform += ' scale(0.85)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = cursor.style.transform.replace(' scale(0.85)', '');
  });

  updateCursor();
}); 