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
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.querySelector('.window-header');
  
  if (header) {
    header.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // calculate the new position
    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;
    
    // Prevent going above the toolbar (60px from top)
    if (newTop < 60) {
      newTop = 60;
    }
    
    // Prevent going off-screen
    const maxTop = window.innerHeight - element.offsetHeight;
    const maxLeft = window.innerWidth - element.offsetWidth;
    
    if (newTop > maxTop) newTop = maxTop;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newLeft < 0) newLeft = 0;
    
    // set the element's new position
    element.style.top = newTop + "px";
    element.style.left = newLeft + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
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
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '2147483647'; // Maximum z-index value
    cursor.style.willChange = 'transform';
    cursor.style.transform = 'translate(-50%, -50%)';

    // Update cursor position with transform for smooth movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.pageX + 'px';
        cursor.style.top = e.pageY + 'px';
    });

    // Check if cursor is within viewport bounds
    document.addEventListener('mousemove', (e) => {
      const cursor = document.getElementById('cursor');
      const { clientX, clientY } = e;
      const withinX = clientX >= 0 && clientX < window.innerWidth;
      const withinY = clientY >= 0 && clientY < window.innerHeight;
      const isInToolbar = clientY < 50; // Toolbar area

      if (cursor) {
        if (!withinX || (!withinY && !isInToolbar)) {
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
        makeDraggable(win);
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