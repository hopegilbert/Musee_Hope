document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  let mouseX = 0;
  let mouseY = 0;
  let isOutOfBounds = false;

  // Apply initial styling
  cursor.style.transform = 'translate(-50%, -50%)';
  cursor.style.left = '0px';
  cursor.style.top = '0px';

  // Cursor animation loop
  const updateCursor = () => {
    if (
      mouseX < 0 || mouseX > window.innerWidth ||
      mouseY < 0 || mouseY > window.innerHeight
    ) {
      if (!isOutOfBounds) {
        cursor.classList.add('cursor-hidden');
        isOutOfBounds = true;
      }
    } else {
      if (isOutOfBounds) {
        cursor.classList.remove('cursor-hidden');
        isOutOfBounds = false;
      }
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }

    requestAnimationFrame(updateCursor);
  };

  updateCursor(); // Start tracking

  // Update mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Optional: animate cursor on click
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.85)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}); 