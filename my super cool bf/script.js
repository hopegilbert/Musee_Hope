document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const CURSOR_SIZE = 15; // pixels
  const BOTTOM_LEFT_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  function shouldShowCursor(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    // Only show cursor if we're over the main content or specific elements we know are part of the webpage
    return element && (
      element.id === 'cursor' ||
      element.classList.contains('trail') ||
      element.tagName === 'DIV' ||
      element.tagName === 'MAIN' ||
      element.tagName === 'SECTION' ||
      element.tagName === 'P' ||
      element.tagName === 'IMG' ||
      element.tagName === 'H1' ||
      element.tagName === 'H2' ||
      element.tagName === 'H3'
    );
  }

  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    // Always update position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Update visibility
    if (shouldShowCursor(e)) {
      cursor.classList.remove('hidden');
    } else {
      cursor.classList.add('hidden');
    }
  });

  // Handle trail effect
  function createTrail(e) {
    if (!shouldShowCursor(e)) return;

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
    cursor.classList.add('hidden');
  });

  // Initial state
  cursor.classList.add('hidden');
}); 