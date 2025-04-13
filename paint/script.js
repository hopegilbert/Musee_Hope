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
    isDrawing = true;
    const pos = getMousePos(e);
    
    if (currentTool === 'fill') {
      floodFill(Math.round(pos.x), Math.round(pos.y), currentColor);
      isDrawing = false;
      saveState();
      return;
    }
    
    if (currentTool === 'text') {
      if (textInput) {
        document.body.removeChild(textInput);
      }
      
      textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.style.position = 'fixed';
      textInput.style.left = e.clientX + 'px';
      textInput.style.top = e.clientY + 'px';
      textInput.style.background = 'transparent';
      textInput.style.border = '1px solid #000';
      textInput.style.font = '16px Arial';
      textInput.style.zIndex = '1000';
      
      document.body.appendChild(textInput);
      textInput.focus();
      
      textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const text = this.value;
          const rect = mainCanvas.getBoundingClientRect();
          const x = pos.x;
          const y = pos.y;
          
          tempCtx.font = '16px Arial';
          tempCtx.fillStyle = currentColor;
          tempCtx.fillText(text, x, y);
          
          mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
          mainCtx.drawImage(tempCanvas, 0, 0);
          
          document.body.removeChild(this);
          textInput = null;
          saveState();
        }
      });
      return;
    }
    
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
      document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentTool = this.querySelector('img').alt.toLowerCase();
      if (currentTool === 'eraser') {
        mainCanvas.style.cursor = 'cell';
      } else {
        mainCanvas.style.cursor = 'crosshair';
      }
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
  const colors = document.querySelectorAll('.color-grid .color-box');
  
  colors.forEach(color => {
    color.addEventListener('click', () => {
      colors.forEach(c => c.classList.remove('selected'));
      color.classList.add('selected');
      currentColor = color.style.backgroundColor;
    });
  });
  
  // Set initial color to black
  const blackColor = document.querySelector('.color-grid .color-box[style*="background-color: #000000"]');
  if (blackColor) {
    blackColor.classList.add('selected');
    currentColor = blackColor.style.backgroundColor;
  }
  
  // Button event listeners
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      undo();
    });
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      redo();
    });
  }
  
  if (eraserBtn) {
    eraserBtn.addEventListener('click', function() {
      setActiveTool('eraserBtn', 'eraser');
      brushSize = 20;
      this.classList.add('active');
    });
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
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  function getWindowBoundaries() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const paintWindow = document.querySelector('.paint-window');
    const windowWidth = paintWindow.offsetWidth;
    const windowHeight = paintWindow.offsetHeight;
    
    return {
      minX: 0,
      maxX: screenWidth - windowWidth,
      minY: 0,
      maxY: screenHeight - windowHeight
    };
  }

  function setTranslate(element, pos) {
    const boundaries = getWindowBoundaries();
    const x = Math.min(Math.max(pos.x, boundaries.minX), boundaries.maxX);
    const y = Math.min(Math.max(pos.y, boundaries.minY), boundaries.maxY);
    
    if (window.innerWidth <= 768) {
      // On mobile, only allow vertical movement
      element.style.top = `${y}px`;
    } else {
      element.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    const clickedElement = e.target;
    if (clickedElement.closest('.paint-header')) {
      isDragging = true;
      document.querySelector('.paint-window').classList.add('dragging');
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(document.querySelector('.paint-window'), { x: currentX, y: currentY });
    }
  }

  function dragEnd() {
    isDragging = false;
    document.querySelector('.paint-window').classList.remove('dragging');
  }

  // Add event listeners for both mouse and touch events
  document.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('touchend', dragEnd, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', drag);

  // Handle window resize
  window.addEventListener('resize', () => {
    const paintWindow = document.querySelector('.paint-window');
    const boundaries = getWindowBoundaries();
    
    // Ensure window stays within boundaries after resize
    setTranslate(paintWindow, { x: xOffset, y: yOffset });
  });

  // Set initial position
  window.addEventListener('load', () => {
    const paintWindow = document.querySelector('.paint-window');
    if (window.innerWidth <= 768) {
      paintWindow.style.top = '80px';
    } else {
      paintWindow.style.transform = 'translate(20px, 20px)';
    }
  });

  // Touch handling for drawing
  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getMousePos(touch);
    isDrawing = true;
    lastX = pos.x;
    lastY = pos.y;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const pos = getMousePos(touch);
    
    tempCtx.beginPath();
    tempCtx.moveTo(lastX, lastY);
    tempCtx.lineTo(pos.x, pos.y);
    
    if (currentTool === 'eraser') {
      tempCtx.globalCompositeOperation = 'destination-out';
      tempCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.strokeStyle = currentColor;
    }
    
    tempCtx.lineWidth = brushSize;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    tempCtx.stroke();
    
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(tempCanvas, 0, 0);
    
    [lastX, lastY] = [pos.x, pos.y];
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    if (isDrawing) {
      isDrawing = false;
      saveState();
    }
  }

  // Touch handling for draggable window
  function handleWindowTouchStart(e) {
    if (!e.target.closest('.paint-header')) return;
    e.preventDefault();
    const touch = e.touches[0];
    isDragging = true;
    initialX = touch.clientX - xOffset;
    initialY = touch.clientY - yOffset;
  }

  function handleWindowTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    currentX = touch.clientX - initialX;
    currentY = touch.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;
    setTranslate(document.querySelector('.paint-window'), { x: currentX, y: currentY });
  }

  function handleWindowTouchEnd(e) {
    isDragging = false;
  }

  // Add touch event listeners
  mainCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  mainCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  mainCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Add window touch event listeners
  paintWindow.addEventListener('touchstart', handleWindowTouchStart, { passive: false });
  document.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
  document.addEventListener('touchend', handleWindowTouchEnd, { passive: false });

  // Prevent default touch behaviors
  document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.paint-window') || e.target.closest('.main-canvas')) {
      e.preventDefault();
    }
  }, { passive: false });

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

  // Tool button event listeners
  const pencilBtn = document.getElementById('pencilBtn');
  const brushBtn = document.getElementById('brushBtn');
  const fillBtn = document.getElementById('fillBtn');
  const textBtn = document.getElementById('textBtn');
  const sprayBtn = document.getElementById('sprayBtn');
  const rectangleBtn = document.getElementById('rectangleBtn');
  const ellipseBtn = document.getElementById('ellipseBtn');
  const lineBtn = document.getElementById('lineBtn');

  function setActiveTool(toolId, toolName) {
    // Remove active class from all tools
    document.querySelectorAll('.toolbar-buttons button').forEach(btn => btn.classList.remove('active'));
    // Add active class to selected tool
    document.getElementById(toolId).classList.add('active');
    // Set current tool
    currentTool = toolName;
    // Update cursor
    mainCanvas.style.cursor = toolName === 'eraser' ? 'cell' : 'crosshair';
  }

  if (pencilBtn) {
    pencilBtn.addEventListener('click', () => {
      setActiveTool('pencilBtn', 'pencil');
      brushSize = 2;
    });
  }

  if (brushBtn) {
    brushBtn.addEventListener('click', () => {
      setActiveTool('brushBtn', 'brush');
      brushSize = 5;
    });
  }

  if (fillBtn) {
    fillBtn.addEventListener('click', () => {
      setActiveTool('fillBtn', 'fill');
    });
  }

  if (textBtn) {
    textBtn.addEventListener('click', () => {
      setActiveTool('textBtn', 'text');
      brushSize = 16; // Font size
    });
  }

  if (sprayBtn) {
    sprayBtn.addEventListener('click', () => {
      setActiveTool('sprayBtn', 'spray');
      brushSize = 10;  // Larger default size for spray
    });
  }

  if (rectangleBtn) {
    rectangleBtn.addEventListener('click', () => {
      setActiveTool('rectangleBtn', 'rectangle');
      brushSize = 2;
    });
  }

  if (ellipseBtn) {
    ellipseBtn.addEventListener('click', () => {
      setActiveTool('ellipseBtn', 'ellipse');
      brushSize = 2;
    });
  }

  if (lineBtn) {
    lineBtn.addEventListener('click', () => {
      setActiveTool('lineBtn', 'line');
      brushSize = 2;
    });
  }

  // Add fill tool function
  function floodFill(startX, startY, fillColor) {
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    // Get the color we're filling
    const startPos = (startY * tempCanvas.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    const startA = pixels[startPos + 3];
    
    // Convert fill color from string to RGBA
    const fillStyle = tempCtx.fillStyle;
    tempCtx.fillStyle = fillColor;
    const dummyCanvas = document.createElement('canvas');
    const dummyCtx = dummyCanvas.getContext('2d');
    dummyCtx.fillStyle = fillColor;
    dummyCtx.fillRect(0, 0, 1, 1);
    const fillRGBA = dummyCtx.getImageData(0, 0, 1, 1).data;
    tempCtx.fillStyle = fillStyle;
    
    // Check if we're trying to fill with the same color
    if (startR === fillRGBA[0] && startG === fillRGBA[1] && 
        startB === fillRGBA[2] && startA === fillRGBA[3]) {
      return;
    }
    
    // Queue for flood fill
    const queue = [[startX, startY]];
    
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const pos = (y * tempCanvas.width + x) * 4;
      
      // Check if this pixel should be filled
      if (x < 0 || x >= tempCanvas.width || y < 0 || y >= tempCanvas.height ||
          pixels[pos] !== startR || pixels[pos + 1] !== startG ||
          pixels[pos + 2] !== startB || pixels[pos + 3] !== startA) {
        continue;
      }
      
      // Fill the pixel
      pixels[pos] = fillRGBA[0];
      pixels[pos + 1] = fillRGBA[1];
      pixels[pos + 2] = fillRGBA[2];
      pixels[pos + 3] = fillRGBA[3];
      
      // Add adjacent pixels to queue
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    // Update the canvas with filled area
    tempCtx.putImageData(imageData, 0, 0);
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(tempCanvas, 0, 0);
  }
}); 