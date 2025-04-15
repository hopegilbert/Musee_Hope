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
let textBox = null;

// Initialize
window.addEventListener('load', () => {
    resizeCanvas();
    document.querySelector('.tool[data-tool="pencil"]').classList.add('active');
    saveState();
    createTextBox();
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

// Color selection from dropdown
const colorBoxes = document.querySelectorAll('.color-box');
colorBoxes.forEach(box => {
    box.addEventListener('click', () => {
        currentColor = box.style.backgroundColor;
        document.querySelector('#colorsMenu').blur();
    });
});

// Color selection from palette
const colors = document.querySelectorAll('.color');
colors.forEach(color => {
    color.addEventListener('click', () => {
        colors.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        currentColor = color.style.background;
    });
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
    
    if (currentTool === 'text') {
        const rect = canvas.getBoundingClientRect();
        textBox.style.display = 'block';
        textBox.style.left = (e.clientX - rect.left) + 'px';
        textBox.style.top = (e.clientY - rect.top) + 'px';
        textBox.style.fontSize = (currentSize * 12) + 'px';
        textBox.style.color = currentColor;
        textBox.focus();
        return;
    }
    
    // Save initial state for shape tools and brush
    if (['rectangle', 'ellipse', 'line', 'brush'].includes(currentTool)) {
        drawingSurface = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    if (currentTool === 'fill') {
        floodFill(Math.floor(lastX), Math.floor(lastY));
        saveState();
    } else if (currentTool === 'colorpicker') {
        const pixel = ctx.getImageData(Math.floor(lastX), Math.floor(lastY), 1, 1).data;
        currentColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        document.querySelector('.tool[data-tool="pencil"]').click();
    }
}

function draw(e) {
    if (!isDrawing || currentTool === 'text') return;
    
    const [x, y] = getMousePos(e);
    
    // Restore canvas for preview of shapes and brush
    if (['rectangle', 'ellipse', 'line', 'brush'].includes(currentTool)) {
        ctx.putImageData(drawingSurface, 0, 0);
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    
    switch (currentTool) {
        case 'pencil':
            ctx.lineWidth = currentSize;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            [lastX, lastY] = [x, y];
            break;
            
        case 'brush':
            ctx.lineWidth = currentSize * 5;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            [lastX, lastY] = [x, y];
            break;
            
        case 'rectangle':
            ctx.lineWidth = currentSize;
            const width = x - lastX;
            const height = y - lastY;
            if (e.shiftKey) {
                // Draw square
                const size = Math.max(Math.abs(width), Math.abs(height));
                const signX = width >= 0 ? 1 : -1;
                const signY = height >= 0 ? 1 : -1;
                ctx.strokeRect(lastX, lastY, size * signX, size * signY);
            } else {
                ctx.strokeRect(lastX, lastY, width, height);
            }
            break;
            
        case 'ellipse':
            ctx.lineWidth = currentSize;
            if (e.shiftKey) {
                // Draw circle
                const radius = Math.max(Math.abs(x - lastX), Math.abs(y - lastY)) / 2;
                const centerX = lastX + (x - lastX) / 2;
                const centerY = lastY + (y - lastY) / 2;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
            } else {
                const radiusX = Math.abs(x - lastX) / 2;
                const radiusY = Math.abs(y - lastY) / 2;
                const centerX = lastX + (x - lastX) / 2;
                const centerY = lastY + (y - lastY) / 2;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            }
            ctx.stroke();
            break;
            
        case 'line':
            ctx.lineWidth = currentSize;
            ctx.beginPath();
            if (e.shiftKey) {
                // Draw straight line (horizontal, vertical, or 45 degrees)
                const dx = x - lastX;
                const dy = y - lastY;
                if (Math.abs(dx) > Math.abs(dy)) {
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, lastY);
                } else {
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(lastX, y);
                }
            } else {
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
    }
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Save state after drawing is complete
    if (['rectangle', 'ellipse', 'line', 'pencil', 'brush', 'eraser', 'spray'].includes(currentTool)) {
        saveState();
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
    // Remove any redo states
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex++;
    
    // Limit history size to prevent memory issues
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
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
            canvas.style.cursor = 'url("images/pencil-cursor.png") 0 16, crosshair';
            break;
        case 'eraser':
            canvas.style.cursor = 'url("images/eraser-cursor.png") 8 8, cell';
            break;
        case 'fill':
            canvas.style.cursor = 'url("images/fill-cursor.png") 8 8, crosshair';
            break;
        case 'colorpicker':
            canvas.style.cursor = 'url("images/colorpicker-cursor.png") 0 16, crosshair';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        case 'spray':
            canvas.style.cursor = 'url("images/spray-cursor.png") 0 16, crosshair';
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

function createTextBox() {
    textBox = document.createElement('div');
    textBox.contentEditable = true;
    textBox.style.position = 'absolute';
    textBox.style.display = 'none';
    textBox.style.minWidth = '100px';
    textBox.style.minHeight = '20px';
    textBox.style.padding = '2px';
    textBox.style.border = '1px solid #000';
    textBox.style.background = 'white';
    textBox.style.zIndex = '1000';
    textBox.style.cursor = 'text';
    textBox.style.fontFamily = 'Arial';
    
    textBox.addEventListener('blur', finalizeText);
    canvas.parentElement.appendChild(textBox);
}

function finalizeText() {
    if (textBox.style.display === 'none') return;
    
    const text = textBox.innerText;
    if (text.trim()) {
        const rect = textBox.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        ctx.font = `${currentSize * 12}px Arial`;
        ctx.fillStyle = currentColor;
        ctx.fillText(text, rect.left - canvasRect.left, rect.top - canvasRect.top + parseInt(getComputedStyle(textBox).fontSize));
    }
    
    textBox.style.display = 'none';
    textBox.innerText = '';
    saveState();
} 