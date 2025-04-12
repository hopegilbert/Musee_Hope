function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
  
  function navigateTo(page) {
    if (page) {
      window.location.href = page;
    }
  }
  
  // Draggable window logic
  function makeDraggable(windowElement, handleElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    handleElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - windowElement.offsetLeft;
      offsetY = e.clientY - windowElement.offsetTop;
      windowElement.style.zIndex = 1000; // bring to front
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        windowElement.style.left = `${e.clientX - offsetX}px`;
        windowElement.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  // Custom cursor and trail effect
  document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursor');
    const SCALE = 4.5;
    const CURSOR_SIZE = 15; // pixels
    const BOTTOM_LEFT_POINT = {
      x: 9,  // x position of bottom point in original pixel art
      y: 13  // y position of bottom point in original pixel art
    };
    
    document.addEventListener('mousemove', (e) => {
      // Update position
      cursor.style.left = e.pageX + 'px';
      cursor.style.top = e.pageY + 'px';

      // Check if cursor is outside the viewport (not just document content)
      const isOutsideViewport =
        e.clientX < 0 || e.clientY < 0 ||
        e.clientX > window.innerWidth || e.clientY > window.innerHeight;

      // Set visibility based on viewport bounds
      cursor.style.opacity = isOutsideViewport ? '0' : '1';
    });

    // Handle trail effect
    function createTrail(e) {
      const isOutsideViewport =
        e.clientX < 0 || e.clientY < 0 ||
        e.clientX > window.innerWidth || e.clientY > window.innerHeight;

      if (isOutsideViewport) return;

      const trail = document.createElement('div');
      trail.className = 'trail';
      
      // Calculate trail position
      const centerToBottom = ((CURSOR_SIZE / 2) - BOTTOM_LEFT_POINT.y) * SCALE;
      const horizontalOffset = (BOTTOM_LEFT_POINT.x - (CURSOR_SIZE / 2)) * SCALE;
      
      trail.style.left = (e.pageX + horizontalOffset) + 'px';
      trail.style.top = (e.pageY - centerToBottom) + 'px';
      document.body.appendChild(trail);

      // Remove trail element after animation
      setTimeout(() => {
        trail.remove();
      }, 800); // Match animation duration
    }

    document.addEventListener('mousemove', createTrail);

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });

    // Initial state
    cursor.style.opacity = '0';
    cursor.style.transition = 'opacity 0.15s ease';

    // Initialize draggable windows
    const windows = document.querySelectorAll('.draggable-window');
    windows.forEach(win => {
      const handle = win.querySelector('.retro-header') || win.querySelector('.window-header');
      if (handle) makeDraggable(win, handle);
    });
  });