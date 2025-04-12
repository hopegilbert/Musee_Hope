document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const CURSOR_SIZE = 15; // pixels
  const BOTTOM_LEFT_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  function isOverWebContent(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    return element && element.tagName !== 'HTML' && element.tagName !== 'BODY';
  }

  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    // Always update position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Update opacity based on position
    cursor.style.opacity = isOverWebContent(e) ? '1' : '0';
  });

  // Handle trail effect
  function createTrail(e) {
    if (!isOverWebContent(e)) return;

    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate trail position
    const centerToBottom = ((CURSOR_SIZE / 2) - BOTTOM_LEFT_POINT.y) * SCALE;
    const horizontalOffset = (BOTTOM_LEFT_POINT.x - (CURSOR_SIZE / 2)) * SCALE;
    
    trail.style.left = (e.clientX + horizontalOffset) + 'px';
    trail.style.top = (e.clientY - centerToBottom) + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  // Initial state
  cursor.style.opacity = '0';
  cursor.style.transition = 'opacity 0.15s ease';
}); 