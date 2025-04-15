// Initialize canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlayContainer = document.querySelector('.overlay-container');

// Set initial canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 4;
    canvas.height = container.clientHeight - 60;
    
    // Fill with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
}

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 1;
let drawingSurface = null;
let history = [];
let historyIndex = -1;

// Initialize
window.addEventListener('load', () => {
    resizeCanvas();
    document.querySelector('.tool[data-tool="pencil"]').classList.add('active');
});

window.addEventListener('resize', resizeCanvas);

// Tool selection
const tools = document.querySelectorAll('.tool');
tools.forEach(tool => {
    tool.addEventListener('click', () => {
        const toolName = tool.getAttribute('data-tool');
        if (toolName === 'undo') {
            undo();
            return;
        }
        if (toolName === 'redo') {
            redo();
            return;
        }
        tools.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        currentTool = toolName;
        updateCursor();
    });
});

// Color selection
const colors = document.querySelectorAll('.color');
colors.forEach(color => {
    color.addEventListener('click', () => {
        colors.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        currentColor = color.style.backgroundColor;
    });
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
    
    // Save the current canvas state for shape tools
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
        drawingSurface = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    if (currentTool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `${currentSize * 12}px Arial`;
            ctx.fillStyle = currentColor;
            ctx.fillText(text, lastX, lastY);
            saveState();
        }
    } else if (currentTool === 'fill') {
        floodFill(lastX, lastY);
        saveState();
    } else if (currentTool === 'colorpicker') {
        const pixel = ctx.getImageData(lastX, lastY, 1, 1).data;
        currentColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        document.querySelector('.tool[data-tool="pencil"]').click();
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getMousePos(e);
    
    if (['rectangle', 'ellipse', 'line'].includes(currentTool)) {
        // Restore the saved state before drawing the new shape
        ctx.putImageData(drawingSurface, 0, 0);
    }
    
    switch (currentTool) {
        case 'pencil':
            drawPencil(x, y);
            break;
        case 'eraser':
            drawEraser(x, y);
            break;
        case 'spray':
            drawSpray(x, y);
            break;
        case 'rectangle':
            drawRectangle(x, y);
            break;
        case 'ellipse':
            drawEllipse(x, y);
            break;
        case 'line':
            drawLine(x, y);
            break;
    }
    
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        if (['rectangle', 'ellipse', 'line', 'pencil', 'eraser', 'spray'].includes(currentTool)) {
            saveState();
        }
    }
}

// Drawing tools
function drawPencil(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawEraser(x, y) {
    const size = currentSize * 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - size/2, y - size/2, size, size);
}

function drawSpray(x, y) {
    const density = currentSize * 5;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * currentSize * 10;
        const sprayX = x + Math.cos(angle) * radius;
        const sprayY = y + Math.sin(angle) * radius;
        ctx.fillStyle = currentColor;
        ctx.fillRect(sprayX, sprayY, 1, 1);
    }
}

function drawRectangle(x, y) {
    const width = x - lastX;
    const height = y - lastY;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.strokeRect(lastX, lastY, width, height);
}

function drawEllipse(x, y) {
    const width = Math.abs(x - lastX);
    const height = Math.abs(y - lastY);
    ctx.beginPath();
    ctx.ellipse(lastX + (x - lastX)/2, lastY + (y - lastY)/2, width/2, height/2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.stroke();
}

function drawLine(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.stroke();
}

// Fill tool
function floodFill(startX, startY) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    const startPos = (startY * canvas.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    
    const fillColor = hexToRgba(currentColor);
    
    if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) {
        return;
    }
    
    const stack = [[startX, startY]];
    
    while (stack.length) {
        const [x, y] = stack.pop();
        const pos = (y * canvas.width + x) * 4;
        
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
        if (!colorsMatch(pixels[pos], pixels[pos + 1], pixels[pos + 2], {r: startR, g: startG, b: startB})) continue;
        
        pixels[pos] = fillColor.r;
        pixels[pos + 1] = fillColor.g;
        pixels[pos + 2] = fillColor.b;
        pixels[pos + 3] = 255;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function colorsMatch(r1, g1, b1, targetColor, tolerance = 0) {
    return Math.abs(r1 - targetColor.r) <= tolerance &&
           Math.abs(g1 - targetColor.g) <= tolerance &&
           Math.abs(b1 - targetColor.b) <= tolerance;
}

function hexToRgba(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// History management
function saveState() {
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

// Utility functions
function updateCursor() {
    switch (currentTool) {
        case 'pencil':
            canvas.style.cursor = 'crosshair';
            break;
        case 'eraser':
            canvas.style.cursor = 'cell';
            break;
        case 'fill':
            canvas.style.cursor = 'crosshair';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        case 'colorpicker':
            canvas.style.cursor = 'crosshair';
            break;
        default:
            canvas.style.cursor = 'crosshair';
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Category buttons
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        
        // Update active button
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show selected category items
        categoryItems.forEach(items => {
            if (items.getAttribute('data-category') === category) {
                items.style.display = 'flex';
            } else {
                items.style.display = 'none';
            }
        });
    });
});

// Clothing items
const clothingItems = document.querySelectorAll('.clothing-item');
let activeOverlay = null;

clothingItems.forEach(item => {
    item.addEventListener('click', () => {
        const overlayPath = item.getAttribute('data-overlay');
        
        // Remove existing overlay if clicking the same item
        if (activeOverlay && activeOverlay.src.endsWith(overlayPath)) {
            activeOverlay.style.opacity = '0';
            setTimeout(() => {
                if (activeOverlay && activeOverlay.parentNode) {
                    activeOverlay.parentNode.removeChild(activeOverlay);
                }
                activeOverlay = null;
            }, 300);
            return;
        }
        
        // Remove previous overlay
        if (activeOverlay) {
            activeOverlay.style.opacity = '0';
            setTimeout(() => {
                if (activeOverlay && activeOverlay.parentNode) {
                    activeOverlay.parentNode.removeChild(activeOverlay);
                }
            }, 300);
        }
        
        // Create and add new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.width = '80%';
        overlay.style.height = '80%';
        overlay.style.objectFit = 'contain';
        overlay.style.zIndex = '1002';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        
        overlay.onload = () => {
            overlay.style.opacity = '1';
        };
        
        overlayContainer.appendChild(overlay);
        activeOverlay = overlay;
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                undo();
                break;
            case 'y':
                redo();
                break;
        }
    }
}); 