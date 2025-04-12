window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Navigation function
function navigateTo(url) {
  window.location.href = url;
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
    // Initialize dropdown
    const dropdownTab = document.querySelector('.dropdown-tab');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdownTab) {
        dropdownTab.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownTab.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    // Create cursor element if it doesn't exist
    let cursor = document.getElementById('cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'cursor';
        document.body.appendChild(cursor);
    }
    
    // Initialize cursor
    cursor.style.display = 'block';
    cursor.style.opacity = '1';

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Check if cursor is within viewport bounds
    document.addEventListener('mousemove', (e) => {
      const cursor = document.getElementById('cursor');
      const { clientX, clientY } = e;
      const withinX = clientX >= 0 && clientX < window.innerWidth;
      const withinY = clientY >= 0 && clientY < window.innerHeight;

      if (cursor) {
        if (!withinX || !withinY) {
          cursor.classList.add('cursor-hidden');
        } else {
          cursor.classList.remove('cursor-hidden');
        }
      }
    });

    // Show/hide cursor based on mouse position
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursor.classList.remove('hidden');
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursor.classList.add('hidden');
    });

    // Handle trail effect
    function createTrail(e) {
        if (!cursor.classList.contains('hidden')) {
            const trail = document.createElement('div');
            trail.className = 'trail';
            
            trail.style.left = e.clientX + 'px';
            trail.style.top = e.clientY + 'px';
            document.body.appendChild(trail);

            // Remove trail element after animation
            setTimeout(() => {
                trail.remove();
            }, 1000);
        }
    }

    // Add trail effect on mousemove
    document.addEventListener('mousemove', createTrail);

    // Initialize draggable windows
    const windows = document.querySelectorAll('.draggable-window');
    windows.forEach(win => {
        const handle = win.querySelector('.window-header');
        if (handle) makeDraggable(win, handle);
    });
});

// Hide cursor when leaving viewport
document.addEventListener('mouseleave', () => {
  const cursor = document.getElementById('cursor');
  if (cursor) {
    cursor.classList.add('cursor-hidden');
  }
});

document.addEventListener('mouseenter', () => {
  const cursor = document.getElementById('cursor');
  if (cursor) {
    cursor.classList.remove('cursor-hidden');
  }
});