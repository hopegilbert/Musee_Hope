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
  
  // Save initial state
  saveState();
  
  function getMousePos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    
    // Handle both touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: ((clientX - rect.left) * scaleX),
      y: ((clientY - rect.top) * scaleY)
    };
  }
  
  function startDrawing(e) {
    e.preventDefault();
    const pos = getMousePos(e);
    
    if (currentTool === 'fill') {
      floodFill(Math.round(pos.x), Math.round(pos.y), currentColor);
      saveState();
      return;
    }
    
    if (currentTool === 'text') {
        // Remove any existing text input
        if (textInput) {
            document.body.removeChild(textInput);
            textInput = null;
        }
        
        // Create text input
        textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.position = 'fixed';
        textInput.style.left = pos.x + 'px';
        textInput.style.top = pos.y + 'px';
        textInput.style.font = brushSize + 'px Arial';
        textInput.style.color = currentColor;
        textInput.style.border = '1px solid #000';
        textInput.style.padding = '2px';
        textInput.style.margin = '0';
        textInput.style.outline = 'none';
        textInput.style.background = 'transparent';
        textInput.style.zIndex = '1000';
        textInput.style.minWidth = '100px';
        textInput.style.height = brushSize + 'px';
        
        // Add to document
        document.body.appendChild(textInput);
        textInput.focus();
        
        // Store click position
        const clickPos = { x: pos.x, y: pos.y };
        
        // Handle text input
        const handleText = () => {
            const text = textInput.value;
            if (text) {
                mainCtx.font = brushSize + 'px Arial';
                mainCtx.fillStyle = currentColor;
                mainCtx.fillText(text, clickPos.x, clickPos.y);
                tempCtx.drawImage(mainCanvas, 0, 0);
                saveState();
            }
            document.body.removeChild(textInput);
            textInput = null;
        };
        
        // Add event listeners
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleText();
            } else if (e.key === 'Escape') {
                document.body.removeChild(textInput);
                textInput = null;
            }
        });
        
        textInput.addEventListener('blur', handleText);
        return;
    }
    
    isDrawing = true;
    [lastX, lastY] = [pos.x, pos.y];
    [startX, startY] = [pos.x, pos.y];
    
    // For shapes, store the initial canvas state
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(mainCanvas, 0, 0);
    }
    
    // For spray tool, start spraying immediately
    if (currentTool === 'spray') {
      drawSpray(pos.x, pos.y);
    }
  }
  
  function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    switch(currentTool) {
      case 'pencil':
      case 'brush':
      case 'eraser':
        mainCtx.beginPath();
        mainCtx.moveTo(lastX, lastY);
        mainCtx.lineTo(pos.x, pos.y);
        mainCtx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
        mainCtx.lineWidth = brushSize;
        mainCtx.lineCap = 'round';
        mainCtx.lineJoin = 'round';
        mainCtx.stroke();
        
        // Update temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(mainCanvas, 0, 0);
        
        [lastX, lastY] = [pos.x, pos.y];
        break;
        
      case 'spray':
        drawSpray(pos.x, pos.y);
        break;
        
      case 'rectangle':
        // Create a temporary canvas for shape preview
        const rectPreview = document.createElement('canvas');
        rectPreview.width = tempCanvas.width;
        rectPreview.height = tempCanvas.height;
        const rectCtx = rectPreview.getContext('2d');
        
        // Copy the original state
        rectCtx.drawImage(tempCanvas, 0, 0);
        
        // Draw the new rectangle
        const width = pos.x - startX;
        const height = pos.y - startY;
        rectCtx.strokeStyle = currentColor;
        rectCtx.lineWidth = brushSize;
        rectCtx.strokeRect(startX, startY, width, height);
        
        // Update display
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(rectPreview, 0, 0);
        break;
        
      case 'ellipse':
        // Create a temporary canvas for shape preview
        const ellipsePreview = document.createElement('canvas');
        ellipsePreview.width = tempCanvas.width;
        ellipsePreview.height = tempCanvas.height;
        const ellipseCtx = ellipsePreview.getContext('2d');
        
        // Copy the original state
        ellipseCtx.drawImage(tempCanvas, 0, 0);
        
        // Draw the new ellipse
        const radiusX = Math.abs(pos.x - startX) / 2;
        const radiusY = Math.abs(pos.y - startY) / 2;
        const centerX = startX + (pos.x - startX) / 2;
        const centerY = startY + (pos.y - startY) / 2;
        
        ellipseCtx.beginPath();
        ellipseCtx.strokeStyle = currentColor;
        ellipseCtx.lineWidth = brushSize;
        ellipseCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ellipseCtx.stroke();
        
        // Update display
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(ellipsePreview, 0, 0);
        break;
        
      case 'line':
        // Create a temporary canvas for shape preview
        const linePreview = document.createElement('canvas');
        linePreview.width = tempCanvas.width;
        linePreview.height = tempCanvas.height;
        const lineCtx = linePreview.getContext('2d');
        
        // Copy the original state
        lineCtx.drawImage(tempCanvas, 0, 0);
        
        // Draw the new line
        lineCtx.beginPath();
        lineCtx.strokeStyle = currentColor;
        lineCtx.lineWidth = brushSize;
        lineCtx.moveTo(startX, startY);
        lineCtx.lineTo(pos.x, pos.y);
        lineCtx.stroke();
        
        // Update display
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(linePreview, 0, 0);
        break;
    }
  }
  
  function drawSpray(x, y) {
    const density = 50;  // Number of particles
    const radius = brushSize * 2;  // Spray radius based on brush size
    
    tempCtx.fillStyle = currentColor;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const dx = x + r * Math.cos(angle);
      const dy = y + r * Math.sin(angle);
      
      tempCtx.beginPath();
      tempCtx.arc(dx, dy, 0.5, 0, Math.PI * 2);
      tempCtx.fill();
    }
    
    // Update main canvas
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(tempCanvas, 0, 0);
  }
  
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // For shapes, commit the final shape
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
        // Copy the current display to the temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(mainCanvas, 0, 0);
    }
    
    // Save state after drawing is complete
    if (!['fill'].includes(currentTool)) {
        saveState();
    }
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
  mainCanvas.addEventListener('mouseout', stopDrawing);
  
  // Tool selection
  const tools = document.querySelectorAll('.paint-tool');
  tools.forEach(tool => {
    tool.addEventListener('click', function() {
      const toolName = this.querySelector('img').alt.toLowerCase();
      const toolId = toolName + 'Btn';
      setActiveTool(toolId, toolName);
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
  if (colorDropdown) {
    colorDropdown.style.position = 'absolute';
    colorDropdown.style.zIndex = '10000';
  }
  
  // Toggle color dropdown
  if (colorButton) {
    colorButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (colorDropdown) {
        const buttonRect = colorButton.getBoundingClientRect();
        colorDropdown.style.top = (buttonRect.bottom + 5) + 'px';
        colorDropdown.style.left = buttonRect.left + 'px';
        colorDropdown.style.display = colorDropdown.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

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
  function setActiveTool(toolId, toolName) {
    // Remove active class from all tools
    document.querySelectorAll('.toolbar-buttons button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.paint-tool').forEach(tool => tool.classList.remove('active'));
    
    // Add active class to selected tool
    const toolButton = document.getElementById(toolId);
    if (toolButton) {
        toolButton.classList.add('active');
    }
    
    // Set current tool
    currentTool = toolName;
    
    // Update cursor
    mainCanvas.style.cursor = toolName === 'eraser' ? 'cell' : 
                             toolName === 'text' ? 'text' : 'crosshair';
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
            setActiveTool(btnId, settings.tool);
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

  function floodFill(startX, startY, fillColor) {
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
    
    const colorToFill = hexToRgb(fillColor);
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length) {
        const [x, y] = stack.pop();
        const pos = (y * mainCanvas.width + x) * 4;
        
        if (x < 0 || x >= mainCanvas.width || y < 0 || y >= mainCanvas.height) continue;
        if (visited.has(`${x},${y}`)) continue;
        if (!matchStartColor(pos)) continue;
        
        visited.add(`${x},${y}`);
        pixels[pos] = colorToFill.r;
        pixels[pos + 1] = colorToFill.g;
        pixels[pos + 2] = colorToFill.b;
        pixels[pos + 3] = 255;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    mainCtx.putImageData(imageData, 0, 0);
    tempCtx.drawImage(mainCanvas, 0, 0);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  // Add touch event listeners
  mainCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    
    const touchEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: mainCanvas
    };
    
    startDrawing(touchEvent);
  }, { passive: false });

  mainCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const touchEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: mainCanvas
    };
    
    draw(touchEvent);
  }, { passive: false });

  mainCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
  }, { passive: false });

  mainCanvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    stopDrawing();
  }, { passive: false });
}); 