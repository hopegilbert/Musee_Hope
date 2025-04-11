document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  
  // Handle cursor visibility
  document.addEventListener('mousemove', (e) => {
    // Check if cursor is within viewport
    if (e.clientX < 0 || e.clientX > window.innerWidth ||
        e.clientY < 0 || e.clientY > window.innerHeight) {
      cursor.classList.add('hidden');
    } else {
      cursor.classList.remove('hidden');
    }
    
    // Update cursor position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
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
    
    // Calculate the bottom point of the cursor
    // The cursor art is 15x15 pixels, scaled by 4.5
    // We want the bottom point, which is at (9,13) in the original pixel art
    const cursorSize = 15 * 4.5; // Total size after scaling
    const bottomX = 9 * 4.5; // X position of bottom point
    const bottomY = 13 * 4.5; // Y position of bottom point
    
    // Position trail at the bottom point of the cursor
    trail.style.left = (e.clientX) + 'px';
    trail.style.top = (e.clientY + cursorSize/2) + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);
}); 