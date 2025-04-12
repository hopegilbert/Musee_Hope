const cursor = document.getElementById('cursor');
let isCursorVisible = false;

// Utility to check if cursor is inside the window bounds
function isCursorInViewport() {
  const rect = cursor.getBoundingClientRect();
  return rect.left >= 0 && rect.top >= 0 &&
         rect.right <= window.innerWidth &&
         rect.bottom <= window.innerHeight;
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

  // Check if cursor is in viewport or browser chrome
  const inViewport = isCursorInViewport();
  const inChrome = isInBrowserChrome(e);

  if (inViewport || inChrome) {
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