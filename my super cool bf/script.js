document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const CURSOR_SIZE = 15; // pixels
  const BOTTOM_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    // Get the element under the cursor
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    
    // Hide cursor if outside document body or null
    if (!elementUnderCursor || elementUnderCursor === document.documentElement) {
      cursor.classList.add('hidden');
      return;
    }
    
    cursor.classList.remove('hidden');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Hide cursor when mouse leaves the document
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
  });

  // Show cursor when mouse enters the document body
  document.body.addEventListener('mouseenter', () => {
    cursor.classList.remove('hidden');
  });

  // Handle trail effect
  function createTrail(e) {
    // Get the element under the cursor
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    
    // Don't create trail if outside document body
    if (!elementUnderCursor || elementUnderCursor === document.documentElement) {
      return;
    }

    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate the offset from cursor center to bottom point
    const centerOffset = CURSOR_SIZE / 2; // half of the cursor size
    const xOffset = (BOTTOM_POINT.x - centerOffset) * SCALE;
    const yOffset = (BOTTOM_POINT.y - centerOffset) * SCALE;
    
    // Position trail at the bottom point of the cursor
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
    // Check if cursor should be hidden after resize
    const rect = cursor.getBoundingClientRect();
    const elementAtRect = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    if (!elementAtRect || elementAtRect === document.documentElement) {
      cursor.classList.add('hidden');
    }
  });
}); 