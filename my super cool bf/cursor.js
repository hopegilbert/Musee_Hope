const cursor = document.getElementById('cursor');
let isCursorVisible = true; // Start with cursor visible
let lastMouseMoveTime = Date.now();
let lastKnownPosition = { x: 0, y: 0 };

// Utility to check if mouse is inside the window bounds
function isInViewport(e) {
  const buffer = 50; // Increased buffer zone
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

// Update cursor position with requestAnimationFrame for smoother movement
function updateCursorPosition(x, y) {
  cursor.style.left = x + 'px';
  cursor.style.top = y + 'px';
  lastKnownPosition = { x, y };
}

// Check cursor position periodically
function checkCursorPosition() {
  const timeSinceLastMove = Date.now() - lastMouseMoveTime;
  
  // If mouse hasn't moved in 3 seconds, start checking visibility
  if (timeSinceLastMove > 3000) {
    const rect = cursor.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    if (centerX < 0 || centerX > window.innerWidth ||
        centerY < 0 || centerY > window.innerHeight) {
      cursor.style.opacity = '0';
      isCursorVisible = false;
    }
  } else {
    // Keep cursor visible if mouse has moved recently
    cursor.style.opacity = '1';
    isCursorVisible = true;
  }
}

// Use requestAnimationFrame for smoother updates
let animationFrameId;
function animateCursor() {
  updateCursorPosition(lastKnownPosition.x, lastKnownPosition.y);
  animationFrameId = requestAnimationFrame(animateCursor);
}

// Start the animation loop
animateCursor();

document.addEventListener('mousemove', (e) => {
  lastMouseMoveTime = Date.now();
  lastKnownPosition = { x: e.pageX, y: e.pageY };
  
  // If mouse is in bounds or in browser chrome, show cursor
  if (isInViewport(e) || isInBrowserChrome(e)) {
    cursor.style.opacity = '1';
    isCursorVisible = true;
  }
});

// Check cursor position every 100ms
setInterval(checkCursorPosition, 100);

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

// Clean up animation frame on page unload
window.addEventListener('unload', () => {
  cancelAnimationFrame(animationFrameId);
}); 