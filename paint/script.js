document.addEventListener('DOMContentLoaded', () => {
  console.log('Paint script loaded');
  
  const mainCanvas = document.getElementById('mainCanvas');
  const mainCtx = mainCanvas.getContext('2d');
  
  if (!mainCanvas || !mainCtx) {
    console.error('Canvas or context not found!');
    return;
  }
  
  console.log('Canvas size:', mainCanvas.width, 'x', mainCanvas.height);
  
  // Initialize canvases
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Initialize size control
  const sizeControl = document.querySelector('.size-control');
  const sizeSlider = document.querySelector('.size-slider');
  const sizePreview = document.querySelector('.size-preview-dot');
  const sizeValue = document.querySelector('.size-value');
  
  function updateSizePreview() {
    if (sizePreview && sizeValue) {
      sizePreview.style.width = brushSize + 'px';
      sizePreview.style.height = brushSize + 'px';
      sizeValue.textContent = brushSize + 'px';
      
      // Update preview color based on tool
      if (currentTool === 'eraser') {
        sizePreview.style.backgroundColor = '#FFFFFF';
        sizePreview.style.border = '1px solid #000000';
      } else {
        sizePreview.style.backgroundColor = currentColor;
        sizePreview.style.border = 'none';
      }
    }
  }
  
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      brushSize = parseInt(e.target.value);
      updateSizePreview();
    });
  }
  
  // Set canvas size
  function setCanvasSize() {
    // Always set main canvas to fill the screen
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    tempCanvas.width = window.innerWidth;
    tempCanvas.height = window.innerHeight;
    
    // Set white background
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }
  
  // Initialize canvas size
  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let startX = 0;
  let startY = 0;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let brushSize = 1;
  let drawingStates = [];
  let currentStateIndex = -1;
  let canvasHistory = [];
  let historyIndex = -1;
  const MAX_HISTORY = 20;
  let isDrawingShape = false;
  let textInput = null;
  let points = [];
  
  // Save initial state
  saveState();
  
  function getEventCoords(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    
    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  function startDrawing(e) {
    e.preventDefault();
    const coords = getEventCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    points = [{ x: lastX, y: lastY }];

    if (currentTool === 'fill') {
        floodFill(Math.floor(lastX), Math.floor(lastY));
        return;
    } else if (currentTool === 'text') {
        showTextInput(e);
        return;
    }

    isDrawing = true;
    tempCtx.beginPath();
    draw(e);
  }
  
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getEventCoords(e);
    const x = coords.x;
    const y = coords.y;
    points.push({ x, y });

    // Clear temp canvas only for tools that need it
    if (currentTool !== 'eraser' && currentTool !== 'spray') {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    switch (currentTool) {
      case 'pencil':
      case 'brush':
        if (currentTool === 'pencil') {
          drawFreehand(points);
        } else {
          drawBrush(points);
        }
        // Copy to main canvas for continuous effect
        mainCtx.drawImage(tempCanvas, 0, 0);
        break;
      case 'spray':
        drawSpray(x, y);
        break;
      case 'eraser':
        drawEraser(points);
        break;
      case 'line':
        drawLine(lastX, lastY, x, y);
        break;
      case 'rectangle':
        drawRectangle(lastX, lastY, x - lastX, y - lastY);
        break;
      case 'ellipse':
        drawCircle(lastX, lastY, x, y);
        break;
    }
  }
  
  function drawEraser(points) {
    if (points.length < 2) return;
    
    mainCtx.strokeStyle = '#FFFFFF';
    mainCtx.lineWidth = brushSize * 2;
    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';
    
    mainCtx.beginPath();
    mainCtx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    mainCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    mainCtx.stroke();
  }
  
  function drawSpray(x, y) {
    const density = 30;  // Reduced for better performance
    const radius = brushSize * 2;
    
    mainCtx.fillStyle = currentColor;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const dx = x + r * Math.cos(angle);
      const dy = y + r * Math.sin(angle);
      
      mainCtx.beginPath();
      mainCtx.arc(dx, dy, 0.5, 0, Math.PI * 2);
      mainCtx.fill();
    }
  }
  
  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Only commit temp canvas if we're using it
    if (currentTool !== 'eraser' && currentTool !== 'spray') {
      mainCtx.drawImage(tempCanvas, 0, 0);
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    saveState();
    points = []; // Clear points array
  }
  
  // Save current canvas state to history
  function saveState() {
    historyIndex++;
    if (historyIndex < canvasHistory.length) {
      canvasHistory = canvasHistory.slice(0, historyIndex);
    }
    canvasHistory.push({
      main: mainCanvas.toDataURL(),
      temp: tempCanvas.toDataURL()
    });
    
    if (canvasHistory.length > MAX_HISTORY) {
      canvasHistory.shift();
      historyIndex--;
    }
    
    updateButtonStates();
  }
  
  // Update undo/redo button states
  function updateButtonStates() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    if (redoBtn) redoBtn.style.opacity = historyIndex >= canvasHistory.length - 1 ? '0.5' : '1';
  }
  
  // Load state from history
  function loadState(index) {
    if (index >= 0 && index < canvasHistory.length) {
      const state = canvasHistory[index];
      const mainImg = new Image();
      const tempImg = new Image();
      
      mainImg.onload = () => {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(mainImg, 0, 0);
      };
      
      tempImg.onload = () => {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(tempImg, 0, 0);
      };
      
      mainImg.src = state.main;
      tempImg.src = state.temp;
      updateButtonStates();
    }
  }
  
  // Undo/Redo functions
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      loadState(historyIndex);
    }
  }
  
  function redo() {
    if (historyIndex < canvasHistory.length - 1) {
      historyIndex++;
      loadState(historyIndex);
    }
  }
  
  // Event listeners for canvas
  mainCanvas.addEventListener('mousedown', startDrawing);
  mainCanvas.addEventListener('mousemove', draw);
  mainCanvas.addEventListener('mouseup', stopDrawing);
  mainCanvas.addEventListener('mouseleave', stopDrawing);
  
  mainCanvas.addEventListener('touchstart', startDrawing);
  mainCanvas.addEventListener('touchmove', draw);
  mainCanvas.addEventListener('touchend', stopDrawing);
  mainCanvas.addEventListener('touchcancel', stopDrawing);
  
  // Prevent scrolling when touching the canvas
  mainCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  mainCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  // Tool selection
  const tools = document.querySelectorAll('.paint-tool');
  tools.forEach(tool => {
    tool.addEventListener('click', function() {
      const toolName = this.querySelector('img').alt.toLowerCase();
      const toolId = toolName + 'Btn';
      setActiveTool(toolName);
      brushSize = toolButtons[toolId]?.size || 2;
    });
  });
  
  // Item selection
  const items = document.querySelectorAll('.paint-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Color selection
  const colorButton = document.querySelector('.color-button');
  const colorOptions = document.querySelectorAll('.color-option');
  const colorBoxes = document.querySelectorAll('.paint-colors .color-box');
  const menuColorBoxes = document.querySelectorAll('.color-grid .color-box');
  
  function updateColorSelection(newColor) {
    currentColor = newColor;
    if (colorButton) {
      colorButton.style.backgroundColor = currentColor;
    }
    if (mainCtx) {
      mainCtx.strokeStyle = currentColor;
      mainCtx.fillStyle = currentColor;
    }
    // Update selected states
    menuColorBoxes.forEach(b => b.classList.remove('selected'));
    colorBoxes.forEach(b => b.classList.remove('selected'));
  }
  
  // Setup color dropdown positioning
  const colorDropdown = document.querySelector('.color-dropdown');
  const colorOptionsContainer = document.querySelector('.color-options');
  if (colorDropdown) {
    colorDropdown.style.position = 'fixed';
    colorDropdown.style.zIndex = '999999';
    
    // Style for mobile
    if (window.innerWidth <= 768) {
      colorDropdown.style.position = 'fixed';
      colorDropdown.style.zIndex = '999999';
      if (colorOptionsContainer) {
        colorOptionsContainer.style.position = 'fixed';
        colorOptionsContainer.style.zIndex = '999999';
      }
    }
  }
  
  // Toggle color dropdown
  if (colorButton) {
    colorButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (colorDropdown) {
        const buttonRect = colorButton.getBoundingClientRect();
        const windowRect = paintWindow.getBoundingClientRect();
        
        // Position differently for mobile
        if (window.innerWidth <= 768) {
          colorDropdown.style.top = (buttonRect.bottom + 5) + 'px';
          colorDropdown.style.left = '50%';
          colorDropdown.style.transform = 'translateX(-50%)';
          colorDropdown.style.width = '90vw';
          colorDropdown.style.maxWidth = '300px';
        } else {
          // Desktop positioning
          colorDropdown.style.top = buttonRect.bottom + 'px';
          colorDropdown.style.left = Math.max(buttonRect.left, windowRect.left) + 'px';
          colorDropdown.style.transform = 'none';
          colorDropdown.style.width = 'auto';
        }
        
        colorDropdown.style.display = colorDropdown.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Update color dropdown position on window resize
  window.addEventListener('resize', () => {
    if (colorDropdown && colorDropdown.style.display !== 'none') {
      const buttonRect = colorButton.getBoundingClientRect();
      const windowRect = paintWindow.getBoundingClientRect();
      
      if (window.innerWidth <= 768) {
        colorDropdown.style.top = (buttonRect.bottom + 5) + 'px';
        colorDropdown.style.left = '50%';
        colorDropdown.style.transform = 'translateX(-50%)';
        colorDropdown.style.width = '90vw';
        colorDropdown.style.maxWidth = '300px';
      } else {
        colorDropdown.style.top = buttonRect.bottom + 'px';
        colorDropdown.style.left = Math.max(buttonRect.left, windowRect.left) + 'px';
        colorDropdown.style.transform = 'none';
        colorDropdown.style.width = 'auto';
      }
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (colorDropdown && !colorDropdown.contains(e.target) && !colorButton.contains(e.target)) {
      colorDropdown.style.display = 'none';
    }
  });
  
  // Menu color boxes functionality
  menuColorBoxes.forEach(box => {
    box.addEventListener('click', function() {
      updateColorSelection(this.style.backgroundColor);
      this.classList.add('selected');
    });
  });
  
  // Color dropdown functionality
  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      updateColorSelection(this.style.backgroundColor);
    });
  });
  
  // Paint window color boxes functionality
  colorBoxes.forEach(box => {
    box.addEventListener('click', function() {
      updateColorSelection(this.style.backgroundColor);
      this.classList.add('selected');
    });
  });
  
  // Initialize canvas context color
  if (mainCtx) {
    mainCtx.strokeStyle = currentColor;
    mainCtx.fillStyle = currentColor;
  }
  
  // Tool selection
  function setActiveTool(tool) {
    currentTool = tool;
    updateCursor();
    
    // Reset drawing state
    isDrawing = false;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Update UI
    document.querySelectorAll('.paint-tool').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
            
            // Position size control under the active tool
            const sizeControl = document.querySelector('.size-control');
            if (['pencil', 'brush', 'eraser', 'spray', 'line', 'rectangle', 'ellipse'].includes(tool)) {
                const btnRect = btn.getBoundingClientRect();
                const windowRect = document.querySelector('.paint-window').getBoundingClientRect();
                
                // Position the size control relative to the viewport
                sizeControl.style.position = 'fixed';
                sizeControl.style.zIndex = '999999';
                
                // Mobile positioning
                if (window.innerWidth <= 768) {
                    sizeControl.style.top = (btnRect.bottom + 5) + 'px';
                    sizeControl.style.left = '50%';
                    sizeControl.style.transform = 'translateX(-50%)';
                    sizeControl.style.width = '90vw';
                    sizeControl.style.maxWidth = '300px';
                } else {
                    // Desktop positioning
                    sizeControl.style.top = btnRect.bottom + 'px';
                    sizeControl.style.left = Math.max(btnRect.left, windowRect.left) + 'px';
                    sizeControl.style.transform = 'none';
                    sizeControl.style.width = 'auto';
                }
                
                sizeControl.style.display = 'flex';
                updateSizePreview();
            } else {
                sizeControl.style.display = 'none';
            }
        }
    });
  }
  
  // Tool button event listeners
  const toolButtons = {
    'pencilBtn': { tool: 'pencil', size: 2 },
    'brushBtn': { tool: 'brush', size: 5 },
    'eraserBtn': { tool: 'eraser', size: 20 },
    'fillBtn': { tool: 'fill', size: 1 },
    'textBtn': { tool: 'text', size: 16 },
    'sprayBtn': { tool: 'spray', size: 10 },
    'rectangleBtn': { tool: 'rectangle', size: 2 },
    'ellipseBtn': { tool: 'ellipse', size: 2 },
    'lineBtn': { tool: 'line', size: 2 }
  };
  
  Object.entries(toolButtons).forEach(([btnId, settings]) => {
    const button = document.getElementById(btnId);
    if (button) {
        button.addEventListener('click', () => {
            setActiveTool(settings.tool);
            brushSize = settings.size;
        });
    }
  });
  
  // Add direct click handlers for fill and text tools
  document.getElementById('fillBtn')?.addEventListener('click', () => {
    currentTool = 'fill';
    mainCanvas.style.cursor = 'crosshair';
  });

  document.getElementById('textBtn')?.addEventListener('click', () => {
    currentTool = 'text';
    mainCanvas.style.cursor = 'text';
  });
  
  // Undo/Redo button listeners
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        } else if (e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }
  });
  
  // Draggable window functionality
  const paintWindow = document.getElementById('paintWindow');
  const paintHeader = document.getElementById('paintHeader');

  function makeDraggable(element, handle) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - currentX;
            initialY = e.touches[0].clientY - currentY;
        } else {
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
        }

        if (e.target === handle || handle.contains(e.target)) {
            isDragging = true;
            element.classList.add('dragging');
        }
    }

    function dragEnd() {
        isDragging = false;
        element.classList.remove('dragging');
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            let newX, newY;
            if (e.type === "touchmove") {
                newX = e.touches[0].clientX - initialX;
                newY = e.touches[0].clientY - initialY;
            } else {
                newX = e.clientX - initialX;
                newY = e.clientY - initialY;
            }
            
            // Get toolbar height and position
            const toolbar = document.querySelector('.main-window');
            const toolbarRect = toolbar.getBoundingClientRect();
            const toolbarBottom = toolbarRect.bottom;
            
            // Constrain Y position to not go above toolbar
            if (newY < toolbarBottom) {
                newY = toolbarBottom;
                // Also adjust initialY to prevent jumping
                if (e.type === "touchmove") {
                    initialY = e.touches[0].clientY - newY;
                } else {
                    initialY = e.clientY - newY;
                }
            }
            
            // Update position
            currentX = newX;
            currentY = newY;
            element.style.left = currentX + "px";
            element.style.top = currentY + "px";
        }
    }

    // Mouse events
    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch events
    handle.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }

  // Initialize draggable window
  if (paintWindow && paintHeader) {
    // Calculate responsive size based on viewport
    const updateWindowSize = () => {
      const windowWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate window size (30% of viewport width, max 600px)
      const windowSize = Math.min(windowWidth * 0.3, 600);
      const paintWindowHeight = windowSize * 1.2; // 20% taller than width
      
      // Set window dimensions
      paintWindow.style.width = windowSize + 'px';
      paintWindow.style.height = paintWindowHeight + 'px';

      // Adjust button sizes
      const buttons = paintWindow.querySelectorAll('.paint-toolbar button');
      const buttonSize = Math.min(Math.max(windowSize * 0.08, 30), 45); // Between 30px and 45px
      buttons.forEach(button => {
        button.style.width = buttonSize + 'px';
        button.style.height = buttonSize + 'px';
        button.style.margin = (buttonSize * 0.1) + 'px';
        // Scale icons inside buttons
        const icon = button.querySelector('i');
        if (icon) {
          const iconSize = Math.max(buttonSize * 0.6, 16) + 'px';
          icon.style.fontSize = iconSize;
        }
      });

      // Adjust color buttons
      const colorButtons = paintWindow.querySelectorAll('.color-option');
      const colorButtonSize = Math.min(Math.max(windowSize * 0.06, 25), 40); // Between 25px and 40px
      colorButtons.forEach(button => {
        button.style.width = colorButtonSize + 'px';
        button.style.height = colorButtonSize + 'px';
        button.style.margin = (colorButtonSize * 0.1) + 'px';
      });
      
      // Position window in the center of the screen
      const leftPosition = (windowWidth - windowSize) / 2;
      
      // Get toolbar height and ensure it's positioned correctly
      const toolbar = document.querySelector('.main-window');
      if (toolbar) {
        toolbar.style.position = 'fixed';
        toolbar.style.top = '0';
        toolbar.style.left = '0';
        toolbar.style.width = '100%';
      }
      const toolbarRect = toolbar?.getBoundingClientRect();
      const toolbarBottom = toolbarRect ? toolbarRect.bottom : 0;
      
      // Set position, ensuring it's below the toolbar
      paintWindow.style.left = leftPosition + 'px';
      paintWindow.style.top = (toolbarBottom + 20) + 'px';

      // Update header sizing
      const headerHeight = Math.min(Math.max(windowSize * 0.05, 24), 36);
      paintHeader.style.height = headerHeight + 'px';
      
      // Ensure main canvas stays full screen
      setCanvasSize();
    };
    
    // Initial size update
    updateWindowSize();
    
    // Update on window resize
    window.addEventListener('resize', () => {
      updateWindowSize();
    });
    
    makeDraggable(paintWindow, paintHeader);
  }

  // Update canvas size based on window size
  const updateCanvasSize = () => {
    if (paintWindow) {
      const contentArea = paintWindow.querySelector('.paint-content');
      if (contentArea) {
        // Keep the main canvas full screen
        setCanvasSize();
      }
    }
  };

  // Add resize observer for paint window
  const resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  
  if (paintWindow) {
    resizeObserver.observe(paintWindow);
  }

  // Remove the old draggable window event listeners
  paintWindow.removeEventListener('touchstart', handleWindowTouchStart);
  document.removeEventListener('touchmove', handleWindowTouchMove);
  document.removeEventListener('touchend', handleWindowTouchEnd);

  // Resize handler
  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width <= 768) { // Mobile
      mainCanvas.width = width * 0.95;
      mainCanvas.height = height * 0.6;
    } else { // Desktop
      mainCanvas.width = width;
      mainCanvas.height = height - 92; // Adjust for toolbar height
    }
    
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;
    
    // Redraw canvas with white background
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(tempCanvas, 0, 0);
  }

  // Add resize listener
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial call
  
  // Initialize canvas
  setCanvasSize();
  console.log('Paint initialization complete');

  function floodFill(startX, startY) {
    const imageData = mainCtx.getImageData(0, 0, mainCanvas.width, mainCanvas.height);
    const pixels = imageData.data;
    
    const startPos = (startY * mainCanvas.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    const startA = pixels[startPos + 3];
    
    if (startR === undefined) return; // Out of bounds
    
    const matchStartColor = (pos) => {
      return pixels[pos] === startR &&
             pixels[pos + 1] === startG &&
             pixels[pos + 2] === startB &&
             pixels[pos + 3] === startA;
    };
    
    const fillColor = hexToRgb(currentColor);
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length) {
      const [x, y] = stack.pop();
      const pos = (y * mainCanvas.width + x) * 4;
      
      if (x < 0 || x >= mainCanvas.width || y < 0 || y >= mainCanvas.height) continue;
      if (visited.has(`${x},${y}`)) continue;
      if (!matchStartColor(pos)) continue;
      
      visited.add(`${x},${y}`);
      pixels[pos] = fillColor.r;
      pixels[pos + 1] = fillColor.g;
      pixels[pos + 2] = fillColor.b;
      pixels[pos + 3] = 255;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    mainCtx.putImageData(imageData, 0, 0);
    saveState();
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  // Update cursor style based on current tool
  function updateCursor() {
    switch (currentTool) {
      case 'fill':
        mainCanvas.style.cursor = 'crosshair';
        break;
      case 'text':
        mainCanvas.style.cursor = 'text';
        break;
      case 'eraser':
        mainCanvas.style.cursor = 'cell';
        break;
      default:
        mainCanvas.style.cursor = 'crosshair';
    }
  }

  // Drawing functions
  function drawFreehand(points) {
    if (points.length < 2) return;
    
    tempCtx.strokeStyle = currentColor;
    tempCtx.lineWidth = brushSize;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    
    // Draw the entire path for smoother lines
    tempCtx.beginPath();
    tempCtx.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      tempCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // For the last two points
    if (points.length > 2) {
      tempCtx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    } else {
      tempCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    
    tempCtx.stroke();
  }

  function drawBrush(points) {
    if (points.length < 2) return;
    
    tempCtx.strokeStyle = currentColor;
    tempCtx.lineWidth = brushSize * 2;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    
    // Draw the entire path for smoother lines
    tempCtx.beginPath();
    tempCtx.moveTo(points[0].x, points[0].y);
    
    // Use bezier curves for smoother, more painterly strokes
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = xc;
      const y2 = yc;
      
      tempCtx.bezierCurveTo(
        x1, y1,
        x1, y1,
        x2, y2
      );
    }
    
    // For the last two points
    if (points.length > 2) {
      tempCtx.bezierCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    } else {
      tempCtx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    
    tempCtx.stroke();
  }

  function drawLine(startX, startY, endX, endY) {
    tempCtx.strokeStyle = currentColor;
    tempCtx.lineWidth = brushSize;
    tempCtx.lineCap = 'round';
    
    tempCtx.beginPath();
    tempCtx.moveTo(startX, startY);
    tempCtx.lineTo(endX, endY);
    tempCtx.stroke();
  }

  function drawRectangle(x, y, width, height) {
    tempCtx.strokeStyle = currentColor;
    tempCtx.lineWidth = brushSize;
    tempCtx.strokeRect(x, y, width, height);
  }

  function drawCircle(startX, startY, endX, endY) {
    const radiusX = Math.abs(endX - startX) / 2;
    const radiusY = Math.abs(endY - startY) / 2;
    const centerX = startX + (endX - startX) / 2;
    const centerY = startY + (endY - startY) / 2;
    
    tempCtx.strokeStyle = currentColor;
    tempCtx.lineWidth = brushSize;
    
    tempCtx.beginPath();
    tempCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    tempCtx.stroke();
  }

  function showTextInput(e) {
    const coords = getEventCoords(e);
    
    // Remove any existing text input
    if (textInput) {
        document.body.removeChild(textInput);
    }
    
    // Create new text input
    textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.style.position = 'fixed';
    textInput.style.left = coords.x + 'px';
    textInput.style.top = coords.y + 'px';
    textInput.style.font = brushSize + 'px Arial';
    textInput.style.color = currentColor;
    textInput.style.background = 'transparent';
    textInput.style.border = '1px solid ' + currentColor;
    textInput.style.outline = 'none';
    textInput.style.minWidth = '50px';
    textInput.style.zIndex = '1000000';
    
    document.body.appendChild(textInput);
    textInput.focus();
    
    // Store click position for text placement
    const textX = coords.x;
    const textY = coords.y;
    
    function handleTextInput() {
        const text = textInput.value.trim();
        if (text) {
            mainCtx.font = brushSize + 'px Arial';
            mainCtx.fillStyle = currentColor;
            mainCtx.fillText(text, textX, textY + brushSize);
            saveState();
        }
        document.body.removeChild(textInput);
        textInput = null;
    }
    
    textInput.addEventListener('blur', handleTextInput);
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleTextInput();
        } else if (e.key === 'Escape') {
            document.body.removeChild(textInput);
            textInput = null;
        }
    });
  }

  // Update size preview when color changes
  function updateCurrentColor(color) {
    currentColor = color;
    if (colorButton) {
      colorButton.style.backgroundColor = currentColor;
    }
    if (mainCtx) {
      mainCtx.strokeStyle = currentColor;
      mainCtx.fillStyle = currentColor;
    }
    // Update size preview dot color
    if (sizePreview && currentTool !== 'eraser') {
      sizePreview.style.backgroundColor = currentColor;
    }
  }

  // Tool button event listeners
  document.querySelectorAll('.paint-tool').forEach(tool => {
    tool.addEventListener('click', () => {
      document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
      setActiveTool(tool.dataset.tool);
    });
  });

  // Update size control styling
  if (sizeControl) {
    sizeControl.style.position = 'fixed';
    sizeControl.style.display = 'none';
    sizeControl.style.padding = '10px';
    sizeControl.style.background = '#c0c0c8';
    sizeControl.style.border = '1px solid #808080';
    sizeControl.style.borderRadius = '0';
    sizeControl.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
    sizeControl.style.width = '150px';
    sizeControl.style.zIndex = '999999';
  }

  // Close size control when clicking outside
  document.addEventListener('click', (e) => {
    const sizeControl = document.querySelector('.size-control');
    const activeTool = document.querySelector('.paint-tool.active');
    if (sizeControl && activeTool && 
        !sizeControl.contains(e.target) && 
        !activeTool.contains(e.target)) {
        sizeControl.style.display = 'none';
    }
  });

  // Initialize clothing items
  const paintItems = document.querySelectorAll('.paint-items .paint-item');
  const paintWindowElement = document.querySelector('.paint-window');
  const paintCanvas = paintWindowElement.querySelector('.paint-canvas-container');
  const backgroundImage = paintCanvas.querySelector('.background-image');
  
  // Set up the canvas container
  paintCanvas.style.position = 'relative';
  paintCanvas.style.overflow = 'hidden';
  
  // Create overlay container
  let overlayContainer = paintCanvas.querySelector('.overlay-container');
  if (!overlayContainer) {
    overlayContainer = document.createElement('div');
    overlayContainer.className = 'overlay-container';
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.zIndex = '99999';
    overlayContainer.style.pointerEvents = 'none';
    paintCanvas.appendChild(overlayContainer);
  }
  
  // Add click handlers for clothing items
  paintItems.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('title').toLowerCase();
      console.log('Clicked:', type);
      
      // Create the overlay image path
      const overlayPath = `./images/hope-${type}2.png`;
      console.log('Creating overlay:', overlayPath);
      
      // Remove existing overlay of same type
      const existingOverlay = overlayContainer.querySelector(`.${type}-overlay`);
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      // Create and add new overlay
      const overlay = document.createElement('img');
      overlay.src = overlayPath;
      overlay.className = `${type}-overlay`;
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.objectFit = 'contain';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '99999';
      
      // Debug logging
      overlay.onerror = () => {
        console.error('Failed to load overlay:', overlayPath);
      };
      
      overlay.onload = () => {
        console.log('Successfully loaded overlay:', overlayPath);
        overlayContainer.appendChild(overlay);
      };
    });
  });
}); 