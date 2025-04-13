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
    const width = window.innerWidth;
    const height = window.innerHeight - 92; // Account for toolbar
    
    mainCanvas.width = width;
    mainCanvas.height = height;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Set white background
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, width, height);
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, width, height);
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
    
    return {
      x: ((e.clientX - rect.left) * scaleX),
      y: ((e.clientY - rect.top) * scaleY)
    };
  }
  
  function startDrawing(e) {
    const pos = getMousePos(e);
    
    if (currentTool === 'fill') {
        floodFill(Math.round(pos.x), Math.round(pos.y), currentColor);
        saveState();
        return;
    }
    
    if (currentTool === 'text') {
        if (textInput) {
            document.body.removeChild(textInput);
        }
        
        // Create text input at the exact click position
        const canvasRect = mainCanvas.getBoundingClientRect();
        textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.position = 'fixed';
        textInput.style.left = (canvasRect.left + pos.x) + 'px';
        textInput.style.top = (canvasRect.top + pos.y) + 'px';
        textInput.style.background = 'transparent';
        textInput.style.border = '1px solid #000';
        textInput.style.font = brushSize + 'px Arial';
        textInput.style.zIndex = '1000';
        textInput.style.color = currentColor;
        textInput.style.padding = '0';
        textInput.style.margin = '0';
        textInput.style.outline = 'none';
        textInput.style.minWidth = '100px';
        textInput.style.height = brushSize + 'px';
        
        document.body.appendChild(textInput);
        textInput.focus();
        
        // Store the click position for later use
        const clickPos = { x: pos.x, y: pos.y };
        
        const handleTextInput = (text) => {
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
        
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleTextInput(this.value);
            } else if (e.key === 'Escape') {
                document.body.removeChild(this);
                textInput = null;
            }
        });
        
        textInput.addEventListener('blur', function() {
            handleTextInput(this.value);
        });
        return;
    }
    
    isDrawing = true;
    // For shapes, store the initial canvas state
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
        // Store initial state
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(mainCanvas, 0, 0);
    }
    
    [lastX, lastY] = [pos.x, pos.y];
    [startX, startY] = [pos.x, pos.y];
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    switch(currentTool) {
      case 'pencil':
      case 'brush':
        tempCtx.beginPath();
        tempCtx.moveTo(lastX, lastY);
        tempCtx.lineTo(pos.x, pos.y);
        tempCtx.strokeStyle = currentColor;
        tempCtx.lineWidth = brushSize;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        tempCtx.stroke();
        
        // Update main canvas
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(tempCanvas, 0, 0);
        
        [lastX, lastY] = [pos.x, pos.y];
        break;
        
      case 'eraser':
        tempCtx.beginPath();
        tempCtx.moveTo(lastX, lastY);
        tempCtx.lineTo(pos.x, pos.y);
        tempCtx.strokeStyle = '#FFFFFF';
        tempCtx.lineWidth = brushSize;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        tempCtx.stroke();
        
        // Update main canvas
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(tempCanvas, 0, 0);
        
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
    // If there's an active text input, remove it
    if (textInput) {
        document.body.removeChild(textInput);
        textInput = null;
    }
    
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
    mainCanvas.style.cursor = toolName === 'eraser' ? 'cell' : 'crosshair';
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
    // Set initial position
    paintWindow.style.left = "20px";
    paintWindow.style.top = "100px";
    makeDraggable(paintWindow, paintHeader);
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
}); 