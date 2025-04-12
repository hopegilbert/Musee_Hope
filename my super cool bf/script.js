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
    // Force cursor to hide by moving it off-screen
    cursor.style.left = '-100px';
    cursor.style.top = '-100px';
  }
  
  function shouldHideCursor(x, y) {
    // More strict viewport bounds check
    if (x <= 1 || x >= window.innerWidth - 1 || y <= 1 || y >= window.innerHeight - 1) {
      return true;
    }
    
    // Check if we're really over the document
    const elementUnderCursor = document.elementFromPoint(x, y);
    if (!elementUnderCursor || 
        elementUnderCursor === document.documentElement || 
        elementUnderCursor === document.body) {
      return true;
    }
    
    return false;
  }
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    if (shouldHideCursor(e.clientX, e.clientY)) {
      hideCursor();
      return;
    }
    
    cursor.classList.remove('hidden');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Hide cursor when mouse leaves the window
  window.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      hideCursor();
    }
  });

  // Hide cursor when mouse leaves the document
  document.addEventListener('mouseleave', () => {
    hideCursor();
  });

  // Handle mouse entering document
  document.addEventListener('mouseenter', (e) => {
    if (!shouldHideCursor(e.clientX, e.clientY)) {
      cursor.classList.remove('hidden');
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
  });

  // Handle trail effect
  function createTrail(e) {
    if (shouldHideCursor(e.clientX, e.clientY)) {
      return;
    }

    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate the offset from cursor center to bottom-left point
    const centerOffset = CURSOR_SIZE / 2; // half of the cursor size
    const xOffset = (BOTTOM_LEFT_POINT.x - centerOffset) * SCALE;
    const yOffset = (BOTTOM_LEFT_POINT.y - centerOffset) * SCALE;
    
    // Position trail at the bottom-left point of the cursor
    trail.style.left = (e.clientX + xOffset) + 'px';
    trail.style.top = (e.clientY + yOffset) + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);

  // Handle window resize
  window.addEventListener('resize', () => {
    hideCursor();
  });

  // Initial state
  hideCursor();
}); 