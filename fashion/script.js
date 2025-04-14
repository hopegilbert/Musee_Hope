// Canvas setup
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const overlayContainer = document.querySelector('.overlay-container');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 5;
let drawingHistory = [];
let historyIndex = -1;

// Category and overlay management
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');
const activeOverlays = new Map(); // Store active overlays by category
let selectedItems = new Map(); // Track selected items by category

// Initialize with first category active
if (categoryButtons.length > 0 && categoryItems.length > 0) {
    categoryButtons[0].classList.add('active');
    categoryItems[0].classList.add('active');
}

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas();
}

// Initialize canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Tool selection
document.querySelectorAll('.fashion-tool').forEach(tool => {
    tool.addEventListener('click', () => {
        document.querySelectorAll('.fashion-tool').forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        currentTool = tool.dataset.tool;
        
        if (currentTool === 'undo') {
            undo();
        } else if (currentTool === 'redo') {
            redo();
        }
    });
});

// Category button click handler
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        categoryItems.forEach(item => item.classList.remove('active'));
        
        button.classList.add('active');
        const category = button.dataset.category;
        document.querySelector(`.category-items[data-category="${category}"]`).classList.add('active');
    });
});

// Clothing item click handler
document.querySelectorAll('.clothing-item').forEach(item => {
    item.addEventListener('click', () => {
        const overlay = item.dataset.overlay;
        const category = item.closest('.category-items').dataset.category;
        
        // If clicking the same item, remove it
        if (selectedItems.get(category) === item) {
            const existingOverlays = overlayContainer.querySelectorAll(`img[data-category="${category}"]`);
            existingOverlays.forEach(existing => existing.remove());
            selectedItems.delete(category);
            item.classList.remove('selected');
            return;
        }
        
        // Remove selected class from previously selected item in this category
        const previousItem = selectedItems.get(category);
        if (previousItem) {
            previousItem.classList.remove('selected');
        }
        
        // Find all existing overlays for this category
        const existingOverlays = overlayContainer.querySelectorAll(`img[data-category="${category}"]`);
        existingOverlays.forEach(existing => existing.remove());
        
        // Add new overlay
        const overlayImage = document.createElement('img');
        overlayImage.src = overlay;
        overlayImage.dataset.category = category;
        overlayImage.classList.add('overlay-image', 'active');
        overlayContainer.appendChild(overlayImage);
        
        // Update selected item
        selectedItems.set(category, item);
        item.classList.add('selected');
    });
});

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
    if (currentTool === 'fill') {
        floodFill(lastX, lastY);
    }
}

function stopDrawing() {
    isDrawing = false;
    saveState();
}

function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
});

canvas.addEventListener('touchend', stopDrawing);

// Helper functions
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

function saveState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawingHistory = drawingHistory.slice(0, historyIndex + 1);
    drawingHistory.push(imageData);
    historyIndex = drawingHistory.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        redrawCanvas();
    }
}

function redo() {
    if (historyIndex < drawingHistory.length - 1) {
        historyIndex++;
        redrawCanvas();
    }
}

function redrawCanvas() {
    if (drawingHistory[historyIndex]) {
        ctx.putImageData(drawingHistory[historyIndex], 0, 0);
    }
}

// Flood fill implementation
function floodFill(startX, startY) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAt(startX, startY);
    const fillColor = hexToRgba(currentColor);
    
    if (!fillColor) return;
    
    const stack = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set();
    const width = canvas.width;
    const height = canvas.height;
    
    const colorMatch = (r1, g1, b1, a1, r2, g2, b2, a2) => {
        const tolerance = 30;
        return Math.abs(r1 - r2) <= tolerance &&
               Math.abs(g1 - g2) <= tolerance &&
               Math.abs(b1 - b2) <= tolerance &&
               Math.abs(a1 - a2) <= tolerance;
    };
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const index = (y * width + x) * 4;
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited.has(`${x},${y}`)) continue;
        
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        
        if (!colorMatch(r, g, b, a, targetColor.r, targetColor.g, targetColor.b, targetColor.a)) continue;
        
        visited.add(`${x},${y}`);
        data[index] = fillColor.r;
        data[index + 1] = fillColor.g;
        data[index + 2] = fillColor.b;
        data[index + 3] = fillColor.a;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
                  [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function getColorAt(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
    };
}

function hexToRgba(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
} 