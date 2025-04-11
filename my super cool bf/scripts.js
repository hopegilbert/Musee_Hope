function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
  
  function navigateTo(page) {
    if (page) {
      window.location.href = page;
    }
  }
  
  // DRAGGABLE LOGIC
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
  
  // Initialize all draggable windows
  document.addEventListener("DOMContentLoaded", () => {
    const windows = document.querySelectorAll('.draggable-window');
    windows.forEach(win => {
      const handle = win.querySelector('.retro-header') || win.querySelector('.window-header');
      if (handle) makeDraggable(win, handle);
    });
  });