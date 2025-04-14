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
    const fillColor = hexToRgb(currentColor);
    
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

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}

// Category and item handling
document.querySelectorAll('.category-button').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        document.querySelectorAll('.category-items').forEach(items => {
            items.style.display = 'none';
        });
        document.querySelector(`.category-items[data-category="${category}"]`).style.display = 'flex';
    });
});

let touchStartY = 0;
let isScrolling = false;

document.querySelectorAll('.clothing-item').forEach(item => {
    item.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        isScrolling = false;
    });

    item.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = Math.abs(touchY - touchStartY);
        
        if (deltaY > 10) {
            isScrolling = true;
        }
    });

    item.addEventListener('touchend', (e) => {
        if (!isScrolling) {
            handleClothingClick(item);
        }
    });

    item.addEventListener('click', () => {
        if (!isScrolling) {
            handleClothingClick(item);
        }
    });
});

function handleClothingClick(event) {
    const item = event.currentTarget;
    const overlayPath = item.getAttribute('data-overlay');
    const category = item.closest('.category-items').getAttribute('data-category');
    
    // Set z-index based on category
    let zIndex = 1; // Default z-index
    switch(category) {
        case 'jewelry':
            zIndex = 10; // Highest z-index, above everything
            break;
        case 'dress':
            // Check if it's the cardigan
            if (overlayPath.includes('cardigan')) {
                zIndex = 3;
            } else {
                zIndex = 1; // All other dresses at the back
            }
            break;
        case 'hair':
            zIndex = 2;
            break;
        case 'accessories':
            zIndex = 4;
            break;
        default:
            zIndex = 1;
    }

    // Find existing overlay with the same source
    const existingOverlay = Array.from(overlayContainer.querySelectorAll('.overlay-image'))
        .find(img => img.src.includes(overlayPath));

    if (existingOverlay) {
        // If overlay exists and is visible, remove it
        if (existingOverlay.style.opacity === '1') {
            existingOverlay.style.opacity = '0';
            setTimeout(() => {
                existingOverlay.remove();
            }, 300); // Match transition duration
        } else {
            // If overlay exists but is not visible, make it visible
            existingOverlay.style.zIndex = zIndex;
            existingOverlay.style.opacity = '1';
        }
    } else {
        // Create new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.className = 'overlay-image';
        overlay.style.zIndex = zIndex;
        overlay.style.opacity = '0';
        
        overlayContainer.appendChild(overlay);
        
        // Force reflow
        overlay.offsetHeight;
        
        // Fade in
        overlay.style.opacity = '1';
    }
} 