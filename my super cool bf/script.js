document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  
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
    
    // Calculate the bottom point of the cursor
    // The cursor art is 15x15 pixels, scaled by 4.5
    const cursorSize = 15 * 4.5; // Total size after scaling
    
    // Position trail at the bottom point of the cursor
    trail.style.left = e.clientX + 'px';
    trail.style.top = (e.clientY + cursorSize/2) + 'px';
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