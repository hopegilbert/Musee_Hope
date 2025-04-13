document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('paintCanvas');
  const ctx = canvas.getContext('2d');
  const tools = document.querySelectorAll('.paint-tool');
  const menuItems = document.querySelectorAll('.paint-toolbar li');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = 400;  // Match the width we set in HTML
    canvas.height = 600; // Match the height we set in HTML
    
    // Redraw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Initialize canvas
  resizeCanvas();
  saveState();
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let history = [];
  let historyIndex = -1;
  const MAX_HISTORY = 20;
  
  // Save current canvas state to history
  function saveState() {
    history = history.slice(0, historyIndex + 1);
    history.push(canvas.toDataURL());
    historyIndex++;
    
    if (history.length > MAX_HISTORY) {
      history.shift();
      historyIndex--;
    }
    
    updateButtonStates();
  }
  
  // Update undo/redo button states
  function updateButtonStates() {
    undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    redoBtn.style.opacity = historyIndex >= history.length - 1 ? '0.5' : '1';
  }
  
  // Undo last action
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      loadState();
    }
  }
  
  // Redo last undone action
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      loadState();
    }
  }
  
  // Load state from history
  function loadState() {
    const img = new Image();
    img.src = history[historyIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      updateButtonStates();
    };
  }
  
  // Drawing functions
  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 5;
    } else if (currentTool === 'spray-can') {
      drawSpray(e.offsetX, e.offsetY);
      [lastX, lastY] = [e.offsetX, e.offsetY];
      return;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
    }
    
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  
  function drawSpray(x, y) {
    const density = 50;
    const radius = 10;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = currentColor;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const dx = x + r * Math.cos(angle);
      const dy = y + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(dx, dy, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      ctx.globalCompositeOperation = 'source-over';
      saveState();
    }
  }
  
  // Event listeners for canvas
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Tool selection
  tools.forEach(tool => {
    tool.addEventListener('click', () => {
      const toolName = tool.getAttribute('title').toLowerCase();
      currentTool = toolName;
      tools.forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
      
      // Update cursor based on tool
      if (toolName === 'eraser') {
        canvas.style.cursor = 'cell';
      } else if (toolName === 'text') {
        canvas.style.cursor = 'text';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    });
  });
  
  // Menu items
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'new') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (action === 'save') {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
      }
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
  
  // Button event listeners
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  
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
}); 