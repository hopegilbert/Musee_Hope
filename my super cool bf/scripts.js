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
  document.addEventListener("DOMContentLoaded", () => {
    const trailCount = 15;
    const sparkles = [];
  
    for (let i = 0; i < trailCount; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      document.body.appendChild(sparkle);
      sparkles.push(sparkle);
    }
  
    document.addEventListener("mousemove", (e) => {
      let i = 0;
      function animate() {
        if (i >= sparkles.length) return;
        const sparkle = sparkles[i];
        sparkle.style.left = `${e.pageX}px`;
        sparkle.style.top = `${e.pageY}px`;
        sparkle.style.opacity = 1;
        sparkle.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
        sparkle.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(0.5)`;
        setTimeout(() => sparkle.style.opacity = 0, 10);
        i++;
        requestAnimationFrame(animate);
      }
      animate();
    });
  });
  <div id="cursor"></div>
  // Custom cursor
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Scale effect when clicking
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'scale(1)';
  });
});