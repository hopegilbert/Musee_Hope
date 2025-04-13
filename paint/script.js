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
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
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
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (toolFunctions[currentTool]) {
      toolFunctions[currentTool](e);
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
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
      } else if (action === 'save') {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
      }
    });
  });
}); 