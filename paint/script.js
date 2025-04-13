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
  
  // Initialize canvas with white background
  function initCanvas() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    mainCtx.fillStyle = '#FFFFFF';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    saveState();
  }
  
  // Drawing functions
  function getMousePos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
    
    if (currentTool === 'eraser') {
      mainCtx.globalCompositeOperation = 'destination-out';
    } else {
      mainCtx.globalCompositeOperation = 'source-over';
    }
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const rect = mainCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mainCtx.beginPath();
    mainCtx.moveTo(lastX, lastY);
    mainCtx.lineTo(x, y);
    
    if (currentTool === 'eraser') {
      mainCtx.globalCompositeOperation = 'destination-out';
      mainCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      mainCtx.globalCompositeOperation = 'source-over';
      mainCtx.strokeStyle = currentColor;
    }
    
    mainCtx.lineWidth = brushSize;
    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';
    mainCtx.stroke();
    
    [lastX, lastY] = [x, y];
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
    if (isDrawing) {
      isDrawing = false;
      mainCtx.globalCompositeOperation = 'source-over';
      saveState();
    }
  }
  
  // Save current canvas state to history
  function saveState() {
    historyIndex++;
    if (historyIndex < canvasHistory.length) {
      canvasHistory = canvasHistory.slice(0, historyIndex);
    }
    canvasHistory.push(mainCanvas.toDataURL());
    
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
      const img = new Image();
      img.src = canvasHistory[index];
      img.onload = () => {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(img, 0, 0);
        updateButtonStates();
      };
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
      currentTool = 'eraser';
      mainCanvas.style.cursor = 'cell';
      document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
      document.querySelector('.paint-tool[title="Eraser"]').classList.add('active');
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
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
  
  // Initialize canvas
  initCanvas();
  console.log('Paint initialization complete');
}); 