document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const CURSOR_SIZE = 15; // pixels
  const BOTTOM_LEFT_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    // Get window scroll position
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Calculate cursor position relative to viewport
    const cursorX = e.screenX - window.screenX - 50; // offset to allow movement past left edge
    const cursorY = e.screenY - window.screenY - 50; // offset to allow movement past top edge
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursor.style.position = 'fixed';
    cursor.classList.remove('hidden');
  });

  // Handle trail effect
  function createTrail(e) {
    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate trail position using same offsets as cursor
    const cursorX = e.screenX - window.screenX - 50;
    const cursorY = e.screenY - window.screenY - 50;
    
    // Calculate trail position
    const centerToBottom = ((CURSOR_SIZE / 2) - BOTTOM_LEFT_POINT.y) * SCALE;
    const horizontalOffset = (BOTTOM_LEFT_POINT.x - (CURSOR_SIZE / 2)) * SCALE;
    
    trail.style.left = (cursorX + horizontalOffset) + 'px';
    trail.style.top = (cursorY - centerToBottom) + 'px';
    trail.style.position = 'fixed';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
  });
}); 