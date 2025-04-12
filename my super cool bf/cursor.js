const cursor = document.getElementById('cursor');
let isCursorVisible = false;
let lastMouseMoveTime = Date.now();

// Utility to check if mouse is inside the window bounds
function isInViewport(e) {
  const buffer = 20; // Add a small buffer zone
  return e.clientX > -buffer && e.clientY > -buffer &&
         e.clientX < window.innerWidth + buffer &&
         e.clientY < window.innerHeight + buffer;
}

// Check if cursor is in browser chrome (top area)
function isInBrowserChrome(e) {
  // Different handling for Safari and Chrome
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const chromeHeight = isSafari ? 60 : 100; // Safari has a smaller chrome area
  
  return e.screenY < window.screenY + chromeHeight;
}

// Check cursor position periodically
function checkCursorPosition() {
  const rect = cursor.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // If cursor hasn't moved in 2 seconds, keep it visible
  const timeSinceLastMove = Date.now() - lastMouseMoveTime;
  if (timeSinceLastMove < 2000) {
    if (centerX < 0 || centerX > window.innerWidth ||
        centerY < 0 || centerY > window.innerHeight) {
      cursor.style.opacity = '0';
      isCursorVisible = false;
    }
  }
}

// Throttle mousemove events for better performance
let lastMoveTime = 0;
const moveThrottle = 16; // ~60fps

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastMoveTime < moveThrottle) return;
  lastMoveTime = now;
  lastMouseMoveTime = now;

  cursor.style.left = e.pageX + 'px';
  cursor.style.top = e.pageY + 'px';

  // If mouse is in bounds or in browser chrome, show cursor
  if (isInViewport(e) || isInBrowserChrome(e)) {
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

// Check cursor position every 50ms
setInterval(checkCursorPosition, 50);

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