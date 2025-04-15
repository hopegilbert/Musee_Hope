// Category z-index values
const categoryZIndex = {
    'jewelry': 1000,
    'sunglasses': 900,
    'bags': 800,
    'hats': 700,
    'hair': 600,
    'tops': 500,
    'bottoms': 400,
    'dresses': 300,
    'shoes': 200
};

// Background image adjustment
const backgroundImage = document.querySelector('.background-image');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let scale = 1;

// Add scale control to the UI
const scaleControl = document.createElement('div');
scaleControl.className = 'scale-control';
scaleControl.innerHTML = `
    <label for="scale-slider">Size:</label>
    <input type="range" id="scale-slider" min="50" max="150" value="100">
    <span id="scale-value">100%</span>
`;
document.querySelector('.canvas-area').appendChild(scaleControl);

// Handle scale changes
const scaleSlider = document.getElementById('scale-slider');
const scaleValue = document.getElementById('scale-value');
scaleSlider.addEventListener('input', (e) => {
    scale = e.target.value / 100;
    scaleValue.textContent = `${e.target.value}%`;
    updateImageTransform();
});

// Mouse event handlers for dragging
backgroundImage.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

// Touch event handlers for mobile
backgroundImage.addEventListener('touchstart', dragStart);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (e.type === 'mousedown') {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    } else {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    }

    if (e.target === backgroundImage) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();

        if (e.type === 'mousemove') {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        } else {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        updateImageTransform();
    }
}

function dragEnd() {
    isDragging = false;
}

function updateImageTransform() {
    backgroundImage.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
}

// Category and overlay management
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');
const overlayContainer = document.querySelector('.overlay-container');
const selectedItems = new Map(); // Track selected items by category

// Initialize with first category active
if (categoryButtons.length > 0 && categoryItems.length > 0) {
    categoryButtons[0].classList.add('active');
    categoryItems[0].classList.add('active');
}

// Handle category switching
categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // Toggle active state of buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show/hide category items
        categoryItems.forEach(items => {
            if (items.dataset.category === category) {
                items.classList.add('active');
            } else {
                items.classList.remove('active');
            }
        });
    });
});

// Function to reorder overlays based on z-index
function reorderOverlays() {
    const overlays = Array.from(overlayContainer.children);
    overlays.sort((a, b) => {
        const aZIndex = categoryZIndex[a.dataset.category] || 0;
        const bZIndex = categoryZIndex[b.dataset.category] || 0;
        return aZIndex - bZIndex;
    });
    
    // Reappend in correct order
    overlays.forEach(overlay => overlayContainer.appendChild(overlay));
}

// Handle clothing item clicks
document.querySelectorAll('.clothing-item').forEach(item => {
    item.addEventListener('click', () => {
        const overlayPath = item.dataset.overlay;
        const category = item.closest('.category-items').dataset.category;
        
        // Remove all existing overlays for this category
        const existingOverlays = overlayContainer.querySelectorAll(`img[data-category="${category}"]`);
        existingOverlays.forEach(overlay => overlay.remove());
        
        // If clicking the same item, just remove it
        const currentlySelected = selectedItems.get(category);
        if (currentlySelected === item) {
            selectedItems.delete(category);
            item.classList.remove('selected');
            reorderOverlays(); // Reorder remaining overlays
            return;
        }
        
        // Remove selected class from previously selected item
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        
        // Add new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.classList.add('overlay-image');
        overlay.dataset.category = category;
        overlay.style.zIndex = categoryZIndex[category] || 1;
        overlayContainer.appendChild(overlay);
        
        // Update selected item
        selectedItems.set(category, item);
        item.classList.add('selected');
        
        // Reorder all overlays to ensure correct stacking
        reorderOverlays();
    });
});

// Activate first category by default
if (categoryButtons.length > 0) {
    categoryButtons[0].click();
}

// Add CSS for the scale control
const style = document.createElement('style');
style.textContent = `
    .scale-control {
        position: absolute;
        left: 34px;
        bottom: 55px;
        background: #c0c0c0;
        padding: 4px 8px;
        border: 1px solid;
        border-color: #ffffff #808080 #808080 #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1100;
    }
    .scale-control label {
        font-size: 11px;
    }
    .scale-control input {
        width: 100px;
    }
    .scale-control span {
        font-size: 11px;
        min-width: 40px;
    }
    .background-image {
        cursor: move;
        transform-origin: center;
        transition: transform 0.05s ease-out;
    }
`;
document.head.appendChild(style); 