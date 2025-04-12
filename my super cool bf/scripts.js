window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

function toggleDropdown() {
  const dropdown = document.querySelector('.dropdown-content');
  const isVisible = dropdown.style.display === 'block';
  dropdown.style.display = isVisible ? 'none' : 'block';
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

    const cursor = document.getElementById('cursor');
    let isCursorVisible = false;
    let hideTimeout;
    
    const SCALE = 4.5;
    const CURSOR_SIZE = 15; // pixels
    const BOTTOM_LEFT_POINT = {
        x: 9,  // x position of bottom point in original pixel art
        y: 13  // y position of bottom point in original pixel art
    };

    // Utility to check if mouse is inside the window bounds
    function isInViewport(e) {
        return e.clientX > 0 && e.clientY > 0 &&
               e.clientX < window.innerWidth &&
               e.clientY < window.innerHeight;
    }

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.pageX + 'px';
        cursor.style.top = e.pageY + 'px';

        // If mouse is in bounds, show cursor
        if (isInViewport(e)) {
            if (!isCursorVisible) {
                cursor.style.opacity = '1';
                isCursorVisible = true;
            }

            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                cursor.style.opacity = '0';
                isCursorVisible = false;
            }, 200);
        } else {
            // Cursor has moved to edge/out of bounds
            cursor.style.opacity = '0';
            isCursorVisible = false;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        isCursorVisible = false;
    });

    // Handle trail effect
    function createTrail(e) {
        if (!isCursorVisible || !isInViewport(e)) return;

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

    // Initialize draggable windows
    const windows = document.querySelectorAll('.draggable-window');
    windows.forEach(win => {
        const handle = win.querySelector('.window-header');
        if (handle) makeDraggable(win, handle);
    });
});