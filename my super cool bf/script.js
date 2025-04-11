document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  
  // Handle cursor visibility
  document.addEventListener('mousemove', (e) => {
    // Check if cursor is within viewport
    if (e.clientX >= 0 && e.clientX <= window.innerWidth &&
        e.clientY >= 0 && e.clientY <= window.innerHeight) {
      cursor.classList.add('visible');
    } else {
      cursor.classList.remove('visible');
    }
    
    // Update cursor position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseenter', () => {
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
  });

  // Handle trail effect
  function createTrail(e) {
    if (e.clientX < 0 || e.clientX > window.innerWidth ||
        e.clientY < 0 || e.clientY > window.innerHeight) {
      return; // Don't create trail particles outside viewport
    }

    const trail = document.createElement('div');
    trail.className = 'trail visible';
    
    // Calculate the bottom point of the cursor
    // Scale factor is 4.5, and the bottom point is at pixel (9,13)
    const xOffset = 9 * 4.5; // 40.5px
    const yOffset = 13 * 4.5; // 58.5px
    
    trail.style.left = (e.clientX + xOffset) + 'px';
    trail.style.top = (e.clientY + yOffset) + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);
}); 