// Scroll to top on page load
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
  });
  
  // Toggle dropdown visibility
  function toggleDropdown() {
    const menu = document.getElementById("dropdownMenu");
    if (menu) {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    }
  }
  
  // Navigate to selected URL
  function navigateTo(url) {
    if (url) window.location.href = url;
  }
  
  // Enable dragging functionality for windows
  function makeDraggable(windowElement, handleElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    handleElement.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - windowElement.offsetLeft;
      offsetY = e.clientY - windowElement.offsetTop;
      windowElement.style.zIndex = 1000;
    });
  
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        windowElement.style.left = `${e.clientX - offsetX}px`;
        windowElement.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }
  
  // Init interactions on DOM load
  document.addEventListener("DOMContentLoaded", () => {
    const dropdownTab = document.querySelector(".dropdown-tab");
    const dropdownContent = document.querySelector(".dropdown-content");
  
    if (dropdownTab) {
      dropdownTab.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown();
      });
    }
  
    document.addEventListener("click", (e) => {
      if (
        dropdownContent &&
        !dropdownTab.contains(e.target) &&
        !dropdownContent.contains(e.target)
      ) {
        dropdownContent.style.display = "none";
      }
    });
  
    // Make all draggable windows movable
    document.querySelectorAll(".draggable-window").forEach((win) => {
      const handle = win.querySelector(".window-header");
      if (handle) makeDraggable(win, handle);
    });
  });