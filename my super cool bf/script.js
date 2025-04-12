document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const CURSOR_SIZE = 15; // pixels
  const BOTTOM_LEFT_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  function hideCursor() {
    cursor.classList.add('hidden');
    cursor.style.left = '-100px';
    cursor.style.top = '-100px';
  }
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    cursor.classList.remove('hidden');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Hide cursor only when it leaves the window completely
  window.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      hideCursor();
    }
  });

  // Handle trail effect
  function createTrail(e) {
    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate trail position
    const centerToBottom = ((CURSOR_SIZE / 2) - BOTTOM_LEFT_POINT.y) * SCALE;
    const horizontalOffset = (BOTTOM_LEFT_POINT.x - (CURSOR_SIZE / 2)) * SCALE;
    
    // Position trail relative to mouse position
    trail.style.left = (e.clientX + horizontalOffset) + 'px';
    trail.style.top = (e.clientY - centerToBottom) + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);

  // Initial state
  hideCursor();
}); 