document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const SCALE = 4.5;
  const BOTTOM_POINT = {
    x: 9,  // x position of bottom point in original pixel art
    y: 13  // y position of bottom point in original pixel art
  };
  
  // Handle cursor visibility and position
  document.addEventListener('mousemove', (e) => {
    // Check if cursor is within viewport
    if (e.clientX < 0 || e.clientX > window.innerWidth ||
        e.clientY < 0 || e.clientY > window.innerHeight) {
      cursor.classList.add('hidden');
      // Don't update cursor position when outside viewport
      return;
    } else {
      cursor.classList.remove('hidden');
      // Only update position when inside viewport
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
  });

  document.addEventListener('mouseenter', () => {
    cursor.classList.remove('hidden');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
  });

  // Handle trail effect
  function createTrail(e) {
    if (e.clientX < 0 || e.clientX > window.innerWidth ||
        e.clientY < 0 || e.clientY > window.innerHeight) {
      return; // Don't create trail particles outside viewport
    }

    const trail = document.createElement('div');
    trail.className = 'trail';
    
    // Calculate the offset from cursor center to bottom point
    // Since cursor is centered on mouse position, we need to offset by the scaled amount
    const xOffset = (BOTTOM_POINT.x - 7.5) * SCALE; // 7.5 is half of 15px cursor size
    const yOffset = (BOTTOM_POINT.y - 7.5) * SCALE;
    
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
    if (rect.left < 0 || rect.left > window.innerWidth ||
        rect.top < 0 || rect.top > window.innerHeight) {
      cursor.classList.add('hidden');
    }
  });
}); 