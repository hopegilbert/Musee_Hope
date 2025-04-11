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
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    document.body.appendChild(trail);

    // Remove trail element after animation
    setTimeout(() => {
      trail.remove();
    }, 800); // Match animation duration
  }

  document.addEventListener('mousemove', createTrail);
}); 