window.addEventListener("load", () => {
    window.scrollTo(0, 0);
  });
  
  function toggleDropdown() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
  
  function navigateTo(url) {
    window.location.href = url;
  }
  
  function makeDraggable(windowElement, handleElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    handleElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - windowElement.offsetLeft;
      offsetY = e.clientY - windowElement.offsetTop;
      windowElement.style.zIndex = 1000;
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
  
  document.addEventListener('DOMContentLoaded', () => {
    const dropdownTab = document.querySelector('.dropdown-tab');
    const dropdownContent = document.querySelector('.dropdown-content');
  
    if (dropdownTab) {
      dropdownTab.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
      });
    }
  
    document.addEventListener('click', (e) => {
      if (!dropdownTab.contains(e.target) && !dropdownContent.contains(e.target)) {
        dropdownContent.style.display = 'none';
      }
    });
  
    const windows = document.querySelectorAll('.draggable-window');
    windows.forEach(win => {
      const handle = win.querySelector('.window-header');
      if (handle) makeDraggable(win, handle);
    });
  });