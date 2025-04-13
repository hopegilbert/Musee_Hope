document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('paintCanvas');
  const ctx = canvas.getContext('2d');
  const tools = document.querySelectorAll('.tool');
  const menuItems = document.querySelectorAll('.paint-toolbar li');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  
  // Set canvas size
  function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  
  // Initialize canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'pencil';
  let history = [];
  let historyIndex = -1;
  const MAX_HISTORY = 20;
  
  // Save current canvas state to history
  function saveState() {
    // Remove any states after current index
    history = history.slice(0, historyIndex + 1);
    
    // Add new state
    history.push(canvas.toDataURL());
    historyIndex++;
    
    // Limit history size
    if (history.length > MAX_HISTORY) {
      history.shift();
      historyIndex--;
    }
    
    // Update button states
    updateButtonStates();
  }
  
  // Update undo/redo button states
  function updateButtonStates() {
    if (historyIndex <= 0) {
      undoBtn.style.opacity = '0.5';
      undoBtn.style.pointerEvents = 'none';
    } else {
      undoBtn.style.opacity = '1';
      undoBtn.style.pointerEvents = 'auto';
    }
    
    if (historyIndex >= history.length - 1) {
      redoBtn.style.opacity = '0.5';
      redoBtn.style.pointerEvents = 'none';
    } else {
      redoBtn.style.opacity = '1';
      redoBtn.style.pointerEvents = 'auto';
    }
  }
  
  // Undo last action
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        updateButtonStates();
      };
      img.src = history[historyIndex];
    }
  }
  
  // Redo last undone action
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        updateButtonStates();
      };
      img.src = history[historyIndex];
    }
  }
  
  // Drawing functions
  function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  
  // Event listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });
  
  canvas.addEventListener('mousemove', draw);
  
  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveState();
  });
  
  canvas.addEventListener('mouseout', () => {
    isDrawing = false;
    saveState();
  });
  
  // Button event listeners with immediate response
  undoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    undo();
  });
  
  redoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    redo();
  });
  
  eraserBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentTool = currentTool === 'eraser' ? 'pencil' : 'eraser';
    eraserBtn.style.opacity = currentTool === 'eraser' ? '0.7' : '1';
    canvas.style.cursor = currentTool === 'eraser' ? 'cell' : 'crosshair';
  });
  
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
  
  // Tool functions
  const toolFunctions = {
    pencil: (e) => {
      if (!isDrawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    },
    brush: (e) => {
      if (!isDrawing) return;
      ctx.lineWidth = 5;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    },
    eraser: (e) => {
      if (!isDrawing) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    },
    fill: (e) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  // Tool selection
  tools.forEach(tool => {
    tool.addEventListener('click', () => {
      tools.forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
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
  
  // Save initial state
  saveState();
}); 