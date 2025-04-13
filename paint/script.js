document.addEventListener('DOMContentLoaded', () => {
  console.log('Paint script loaded');
  
  const mainCanvas = document.getElementById('mainCanvas');
  const mainCtx = mainCanvas.getContext('2d');
  
  if (!mainCanvas || !mainCtx) {
    console.error('Canvas or context not found!');
    return;
  }
  
  console.log('Canvas size:', mainCanvas.width, 'x', mainCanvas.height);
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let brushSize = 5;
  let canvasHistory = [];
  let historyIndex = -1;
  const MAX_HISTORY = 20;
  let startX, startY;
  let isDrawingShape = false;
  let textInput = null;
  
  // Create a temporary canvas for drawings
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = mainCanvas.width;
  tempCanvas.height = mainCanvas.height;
  
  // Initialize canvas with white background
  function initCanvas() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;
    
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    saveState();
  }
  
  // Drawing functions
  function getMousePos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    return { x, y };
  }
  
  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
        startX = pos.x;
        startY = pos.y;
        isDrawingShape = true;
    } else if (currentTool === 'text') {
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
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                tempCtx.font = '16px Arial';
                tempCtx.fillStyle = currentColor;
                tempCtx.fillText(text, x, y);
                
                mainCtx.fillStyle = '#FFFFFF';
                mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
                mainCtx.drawImage(tempCanvas, 0, 0);
                
                document.body.removeChild(this);
                textInput = null;
                saveState();
            }
        });
    } else {
        lastX = pos.x;
        lastY = pos.y;
    }
    
    if (currentTool === 'eraser') {
        tempCtx.globalCompositeOperation = 'destination-out';
    } else {
        tempCtx.globalCompositeOperation = 'source-over';
    }
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    switch(currentTool) {
        case 'spray':
            drawSpray(pos.x, pos.y);
            break;
            
        case 'rectangle':
        case 'ellipse':
        case 'line':
            // Clear the temp canvas and redraw from the start point
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.beginPath();
            tempCtx.strokeStyle = currentColor;
            tempCtx.lineWidth = brushSize;
            
            if (currentTool === 'rectangle') {
                const width = pos.x - startX;
                const height = pos.y - startY;
                tempCtx.strokeRect(startX, startY, width, height);
            } else if (currentTool === 'ellipse') {
                const radiusX = Math.abs(pos.x - startX) / 2;
                const radiusY = Math.abs(pos.y - startY) / 2;
                const centerX = startX + (pos.x - startX) / 2;
                const centerY = startY + (pos.y - startY) / 2;
                
                tempCtx.beginPath();
                tempCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                tempCtx.stroke();
            } else if (currentTool === 'line') {
                tempCtx.beginPath();
                tempCtx.moveTo(startX, startY);
                tempCtx.lineTo(pos.x, pos.y);
                tempCtx.stroke();
            }
            break;
            
        case 'text':
            // Handle text input when mouse is released
            break;
            
        case 'brush':
            tempCtx.lineWidth = 5;
            // Fall through to default drawing
            
        case 'pencil':
        case 'eraser':
            tempCtx.beginPath();
            tempCtx.moveTo(lastX, lastY);
            tempCtx.lineTo(pos.x, pos.y);
            
            if (currentTool === 'eraser') {
                tempCtx.globalCompositeOperation = 'destination-out';
                tempCtx.strokeStyle = 'rgba(0,0,0,1)';
                tempCtx.lineWidth = 20;
            } else {
                tempCtx.globalCompositeOperation = 'source-over';
                tempCtx.strokeStyle = currentColor;
                tempCtx.lineWidth = currentTool === 'brush' ? 5 : 2;
            }
            
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            tempCtx.stroke();
            break;
    }
    
    // Draw the white background and the temporary canvas
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.drawImage(tempCanvas, 0, 0);
    
    if (['pencil', 'brush', 'eraser'].includes(currentTool)) {
        [lastX, lastY] = [pos.x, pos.y];
    }
  }
  
  function drawSpray(x, y) {
    const density = 50;
    const radius = 10;
    
    mainCtx.globalCompositeOperation = 'source-over';
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
  
  function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    isDrawingShape = false;
    tempCtx.globalCompositeOperation = 'source-over';
    
    if (currentTool !== 'text') {
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
  const colors = document.querySelectorAll('.color-box');
  colors.forEach(color => {
    color.addEventListener('click', () => {
      colors.forEach(c => c.classList.remove('selected'));
      color.classList.add('selected');
      currentColor = color.style.backgroundColor;
    });
  });
  
  // Set initial color to black
  const blackColor = document.querySelector('.color-box[style*="background-color: #000000"]');
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
      if (currentTool === 'eraser') {
        // Switch back to pencil
        currentTool = 'pencil';
        mainCanvas.style.cursor = 'crosshair';
        document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
        document.querySelector('.paint-tool[title="Pencil"]').classList.add('active');
        eraserBtn.classList.remove('active');
      } else {
        // Switch to eraser
        currentTool = 'eraser';
        mainCanvas.style.cursor = 'cell';
        document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
        document.querySelector('.paint-tool[title="Eraser"]').classList.add('active');
        eraserBtn.classList.add('active');
      }
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
  
  paintHeader.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);
  
  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === paintHeader) {
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, paintWindow);
    }
  }
  
  function setTranslate(xPos, yPos, el) {
    // Get toolbar height based on screen size
    const toolbarHeight = window.innerWidth <= 768 ? 120 : 92;
    
    // Get window boundaries
    const maxX = window.innerWidth - el.offsetWidth;
    const maxY = window.innerHeight - el.offsetHeight;
    
    // Constrain position
    xPos = Math.max(0, Math.min(xPos, maxX));
    yPos = Math.max(toolbarHeight, Math.min(yPos, maxY));
    
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    el.classList.toggle('dragging', isDragging);
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
  
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
    setTranslate(currentX, currentY, paintWindow);
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
  initCanvas();
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
    });
  }

  if (sprayBtn) {
    sprayBtn.addEventListener('click', () => {
      setActiveTool('sprayBtn', 'spray');
      brushSize = 1;
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

  // Update eraser button click handler to use setActiveTool
  if (eraserBtn) {
    eraserBtn.addEventListener('click', function() {
      if (currentTool === 'eraser') {
        setActiveTool('pencilBtn', 'pencil');
        brushSize = 2;
        eraserBtn.classList.remove('active');
      } else {
        setActiveTool('eraserBtn', 'eraser');
        brushSize = 20;
        eraserBtn.classList.add('active');
      }
    });
  }
}); 