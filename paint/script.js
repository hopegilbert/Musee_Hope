document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('paintCanvas');
  const ctx = canvas.getContext('2d');
  const tools = document.querySelectorAll('.tool');
  const menuItems = document.querySelectorAll('.paint-toolbar li');
  
  // Set canvas size
  function resizeCanvas() {
    const container = document.querySelector('.paint-canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  
  // Initialize canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Drawing state
  let isDrawing = false;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let lineWidth = 2;
  
  // History for undo/redo
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
  }
  
  // Undo last action
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
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
      };
      img.src = history[historyIndex];
    }
  }
  
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
      ctx.fillStyle = currentColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  // Event listeners
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (toolFunctions[currentTool]) {
      toolFunctions[currentTool](e);
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveState();
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    saveState();
  });
  
  // Tool selection
  tools.forEach(tool => {
    tool.addEventListener('click', () => {
      tools.forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
      currentTool = tool.dataset.tool;
    });
  });
  
  // Menu items
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action === 'new') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
      } else if (action === 'save') {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
      } else if (action === 'undo') {
        undo();
      } else if (action === 'redo') {
        redo();
      }
    });
  });
  
  // Save initial state
  saveState();
}); 