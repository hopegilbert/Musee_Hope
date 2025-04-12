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

  function updateCursorPosition(x, y) {
    // Ensure coordinates are never negative
    const posX = Math.max(0, x);
    const posY = Math.max(0, y);
    
    cursor.classList.remove('hidden');
    cursor.style.left = posX + 'px';
    cursor.style.top = posY + 'px';
  }
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    updateCursorPosition(e.pageX, e.pageY);
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
    
    // Position trail relative to mouse position, ensuring coordinates are never negative
    const trailX = Math.max(0, e.pageX + horizontalOffset);
    const trailY = Math.max(0, e.pageY - centerToBottom);
    
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);

  // Handle scroll events to update cursor position
  document.addEventListener('scroll', (e) => {
    const x = parseInt(cursor.style.left) || 0;
    const y = parseInt(cursor.style.top) || 0;
    updateCursorPosition(x, y);
  });

  // Initial state
  hideCursor();
}); 