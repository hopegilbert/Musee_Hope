document.addEventListener('DOMContentLoaded', () => {
  console.log('Paint script loaded');
  
  // Get canvas elements
  const canvas = document.getElementById('paintCanvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context!');
    return;
  }
  
  console.log('Canvas size:', canvas.width, 'x', canvas.height);
  
  // Initialize canvas with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let history = [];
  let historyIndex = -1;
  const MAX_HISTORY = 20;
  
  // Make window draggable
  const paintWindow = document.getElementById('paintWindow');
  const paintHeader = document.getElementById('paintHeader');
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  paintHeader.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    let newTop = paintWindow.offsetTop - pos2;
    let newLeft = paintWindow.offsetLeft - pos1;
    
    // Prevent going above the toolbar (60px from top)
    if (newTop < 60) {
      newTop = 60;
    }
    
    // Prevent going off-screen
    const maxTop = window.innerHeight - paintWindow.offsetHeight;
    const maxLeft = window.innerWidth - paintWindow.offsetWidth;
    
    if (newTop > maxTop) newTop = maxTop;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newLeft < 0) newLeft = 0;
    
    paintWindow.style.top = newTop + "px";
    paintWindow.style.left = newLeft + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
  
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
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.style.opacity = historyIndex <= 0 ? '0.5' : '1';
    if (redoBtn) redoBtn.style.opacity = historyIndex >= history.length - 1 ? '0.5' : '1';
  }
  
  // Undo/Redo functions
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      loadState();
    }
  }
  
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
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    [lastX, lastY] = [pos.x, pos.y];
    console.log('Started drawing at:', lastX, lastY);
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentTool === 'brush' ? 5 : 2;
    }
    
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [pos.x, pos.y];
    console.log('Drawing to:', pos.x, pos.y);
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
      console.log('Stopped drawing');
      saveState();
    }
  }
  
  // Event listeners for canvas
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Tool selection
  const tools = document.querySelectorAll('.paint-tool');
  tools.forEach(tool => {
    tool.addEventListener('click', () => {
      const toolName = tool.getAttribute('title').toLowerCase();
      console.log('Tool selected:', toolName);
      currentTool = toolName;
      tools.forEach(t => t.classList.remove('active'));
      tool.classList.add('active');
      canvas.style.cursor = toolName === 'eraser' ? 'cell' : 'crosshair';
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
      console.log('Color selected:', currentColor);
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
  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);
  
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
  
  // Initialize history
  saveState();
  console.log('Paint initialization complete');
}); 