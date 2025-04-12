const cursor = document.getElementById('cursor');
let isCursorVisible = false;

// Utility to check if mouse is inside the window bounds
function isInViewport(e) {
  const buffer = 20; // Small buffer zone
  return e.clientX > -buffer && e.clientY > -buffer &&
         e.clientX < window.innerWidth + buffer &&
         e.clientY < window.innerHeight + buffer;
}

// Check if cursor is in browser chrome (top area)
function isInBrowserChrome(e) {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const chromeHeight = isSafari ? 60 : 100;
  return e.screenY < window.screenY + chromeHeight;
}

document.addEventListener('mousemove', (e) => {
  // Update cursor position directly without any animation
  // Offset the position to make the top right corner the click point
  cursor.style.left = (e.pageX - cursor.offsetWidth) + 'px';
  cursor.style.top = e.pageY + 'px';

  // If mouse is in bounds or in browser chrome, show cursor
  if (isInViewport(e) || isInBrowserChrome(e)) {
    cursor.style.opacity = '1';
    isCursorVisible = true;
  } else {
    cursor.style.opacity = '0';
    isCursorVisible = false;
  }
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  isCursorVisible = false;
});

// Handle window focus/blur
window.addEventListener('focus', () => {
  cursor.style.opacity = '1';
  isCursorVisible = true;
});

window.addEventListener('blur', () => {
  cursor.style.opacity = '0';
  isCursorVisible = false;
}); 