// Initialize canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlayContainer = document.querySelector('.overlay-container');

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'images/hope.png';
backgroundImage.onload = function() {
    // Set canvas size based on image dimensions
    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;
    
    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0);
    saveState();
};

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 5;
let history = [];
let historyIndex = -1;

// Initialize canvas with white background
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
saveState();

// Tool buttons
const toolButtons = document.querySelectorAll('.tool-button');
toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        toolButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentTool = button.getAttribute('data-tool');
        updateCursor();
    });
});

// Size control
const sizeInput = document.getElementById('size');
const sizeValue = document.getElementById('size-value');
sizeInput.addEventListener('input', () => {
    currentSize = parseInt(sizeInput.value);
    sizeValue.textContent = currentSize;
    updateCursor();
});

// Color control
const colorInput = document.getElementById('color');
colorInput.addEventListener('input', () => {
    currentColor = colorInput.value;
});

// Canvas size control
const widthInput = document.getElementById('canvas-width');
const heightInput = document.getElementById('canvas-height');
const resizeButton = document.getElementById('resize-canvas');
resizeButton.addEventListener('click', () => {
    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);
    if (newWidth >= 100 && newWidth <= 2000 && newHeight >= 100 && newHeight <= 2000) {
        setCanvasSize(newWidth, newHeight);
    }
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
    if (currentTool === 'text') {
        const text = prompt('Enter text:');
        if (text) {
            ctx.font = `${currentSize}px Arial`;
            ctx.fillStyle = currentColor;
            ctx.fillText(text, lastX, lastY);
            saveState();
        }
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getMousePos(e);
    
    switch (currentTool) {
        case 'pencil':
            drawPencil(x, y);
            break;
        case 'brush':
            drawBrush(x, y);
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

function drawBrush(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function drawEraser(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = currentSize * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawSpray(x, y) {
    const density = currentSize * 2;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * currentSize;
        const sprayX = x + Math.cos(angle) * radius;
        const sprayY = y + Math.sin(angle) * radius;
        ctx.fillStyle = currentColor;
        ctx.fillRect(sprayX, sprayY, 1, 1);
    }
}

function drawRectangle(x, y) {
    const width = x - lastX;
    const height = y - lastY;
    redrawFromState();
    ctx.fillStyle = currentColor;
    ctx.fillRect(lastX, lastY, width, height);
}

function drawEllipse(x, y) {
    const width = x - lastX;
    const height = y - lastY;
    redrawFromState();
    ctx.beginPath();
    ctx.ellipse(lastX + width/2, lastY + height/2, Math.abs(width/2), Math.abs(height/2), 0, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
}

function drawLine(x, y) {
    redrawFromState();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.stroke();
}

function redrawFromState() {
    if (historyIndex >= 0 && history[historyIndex]) {
        const img = new Image();
        img.src = history[historyIndex];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0);
    }
}

// Fill tool
function floodFill(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAt(x, y);
    const fillColor = hexToRgb(currentColor);
    
    if (!targetColor || !fillColor) return;
    
    // Don't fill if clicking the same color
    if (targetColor.r === fillColor.r && targetColor.g === fillColor.g && targetColor.b === fillColor.b) {
        return;
    }
    
    const stack = [[Math.round(x), Math.round(y)]];
    const visited = new Set();
    const width = canvas.width;
    const height = canvas.height;
    
    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const index = (currentY * width + currentX) * 4;
        
        if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) continue;
        if (visited.has(`${currentX},${currentY}`)) continue;
        
        visited.add(`${currentX},${currentY}`);
        
        // Check if current pixel matches target color (with tolerance)
        if (colorsMatch(data[index], data[index + 1], data[index + 2], targetColor)) {
            // Fill the pixel
            data[index] = fillColor.r;
            data[index + 1] = fillColor.g;
            data[index + 2] = fillColor.b;
            data[index + 3] = 255;
            
            // Add neighboring pixels to stack
            stack.push([currentX + 1, currentY]);
            stack.push([currentX - 1, currentY]);
            stack.push([currentX, currentY + 1]);
            stack.push([currentX, currentY - 1]);
            // Add diagonal pixels for better fill
            stack.push([currentX + 1, currentY + 1]);
            stack.push([currentX - 1, currentY - 1]);
            stack.push([currentX + 1, currentY - 1]);
            stack.push([currentX - 1, currentY + 1]);
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveState();
}

function getColorAt(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    return {
        r: data[0],
        g: data[1],
        b: data[2]
    };
}

function colorsMatch(r1, g1, b1, targetColor, tolerance = 32) {
    return Math.abs(r1 - targetColor.r) <= tolerance &&
           Math.abs(g1 - targetColor.g) <= tolerance &&
           Math.abs(b1 - targetColor.b) <= tolerance;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// History management
function saveState() {
    // Remove any states after current index
    history = history.slice(0, historyIndex + 1);
    // Add new state
    history.push(canvas.toDataURL());
    historyIndex = history.length - 1;
    // Limit history size
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        redrawFromState();
    } else if (historyIndex === 0) {
        historyIndex--;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// Canvas size management
function setCanvasSize(width, height) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Fill new canvas with white
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, width, height);
    
    // Copy existing content
    tempCtx.drawImage(canvas, 0, 0);
    
    // Update canvas
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveState();
}

// Cursor update
function updateCursor() {
    switch (currentTool) {
        case 'pencil':
        case 'brush':
        case 'eraser':
        case 'spray':
            canvas.style.cursor = 'crosshair';
            break;
        case 'fill':
            canvas.style.cursor = 'pointer';
            break;
        case 'rectangle':
        case 'ellipse':
        case 'line':
            canvas.style.cursor = 'crosshair';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        default:
            canvas.style.cursor = 'default';
    }
}

// Mouse position helper
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