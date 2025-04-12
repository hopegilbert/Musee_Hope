document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  let mouseX = 0;
  let mouseY = 0;

  // Initial position to center the cursor
  cursor.style.transform = 'translate(-50%, -50%)';
  cursor.style.left = '0px';
  cursor.style.top = '0px';

  // Use requestAnimationFrame for smoother tracking
  const updateCursor = () => {
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    requestAnimationFrame(updateCursor);
  };

  updateCursor(); // Start the loop

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Ensure cursor is visible if within viewport
    cursor.classList.remove('cursor-hidden');
  });

  // Detect when leaving viewport
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('cursor-hidden');
  });

  document.addEventListener('mouseenter', () => {
    cursor.classList.remove('cursor-hidden');
  });

  // Scale on click
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.85)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}); 