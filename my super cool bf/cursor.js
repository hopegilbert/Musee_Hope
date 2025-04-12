const cursor = document.getElementById('cursor');
let isCursorVisible = false;

// Utility to check if mouse is inside the window bounds
function isInViewport(e) {
  return e.clientX > 0 && e.clientY > 0 &&
         e.clientX < window.innerWidth &&
         e.clientY < window.innerHeight;
}

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.pageX + 'px';
  cursor.style.top = e.pageY + 'px';

  // If mouse is in bounds, show cursor
  if (isInViewport(e)) {
    if (!isCursorVisible) {
      cursor.style.opacity = '1';
      isCursorVisible = true;
    }
  } else {
    // Cursor has moved to edge/out of bounds
    cursor.style.opacity = '0';
    isCursorVisible = false;
  }
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  isCursorVisible = false;
}); 