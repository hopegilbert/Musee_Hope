// Initialize canvas and background
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
    
    // Set canvas container size to match image
    const container = document.querySelector('.fashion-canvas-container');
    container.style.width = `${backgroundImage.width}px`;
    container.style.height = `${backgroundImage.height}px`;
};

// Add error handling for image load
backgroundImage.onerror = function() {
    console.error('Failed to load background image:', backgroundImage.src);
};

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
let activeOverlays = new Map(); // Store active overlays by category

clothingItems.forEach(item => {
    let touchStartY = 0;
    let isScrolling = false;

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

    item.addEventListener('touchend', () => {
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

function handleClothingClick(item) {
    const overlayPath = item.getAttribute('data-overlay');
    const category = item.closest('.category-items').getAttribute('data-category');
    
    // Set z-index based on category
    let zIndex = 1;
    switch(category) {
        case 'jewelry':
            zIndex = 10;
            break;
        case 'tops':
            zIndex = 3;
            break;
        case 'bottoms':
            zIndex = 1;
            break;
        case 'hair':
            zIndex = 4;
            break;
        case 'hats':
            zIndex = 5;
            break;
        case 'sunglasses':
            zIndex = 6;
            break;
        case 'bags':
            zIndex = 2;
            break;
        case 'dress':
            zIndex = 1;
            break;
    }

    // Check if there's already an overlay for this category
    const existingOverlay = activeOverlays.get(category);
    
    if (existingOverlay && existingOverlay.src.includes(overlayPath)) {
        // Remove if clicking the same item
        existingOverlay.style.opacity = '0';
        setTimeout(() => {
            existingOverlay.remove();
            activeOverlays.delete(category);
        }, 300);
    } else {
        // Remove existing overlay for this category
        if (existingOverlay) {
            existingOverlay.style.opacity = '0';
            setTimeout(() => existingOverlay.remove(), 300);
        }

        // Create new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.className = 'overlay-image';
        overlay.setAttribute('data-category', category);
        overlay.style.zIndex = zIndex;
        overlay.style.opacity = '0';
        
        // Insert the overlay at the correct position based on z-index
        const overlays = Array.from(overlayContainer.querySelectorAll('.overlay-image'));
        let insertBefore = null;
        
        for (let i = 0; i < overlays.length; i++) {
            const currentZIndex = parseInt(overlays[i].style.zIndex);
            if (zIndex > currentZIndex) {
                insertBefore = overlays[i];
                break;
            }
        }
        
        if (insertBefore) {
            overlayContainer.insertBefore(overlay, insertBefore);
        } else {
            overlayContainer.appendChild(overlay);
        }
        
        // Force reflow and fade in
        overlay.offsetHeight;
        overlay.style.opacity = '1';
        
        // Store as active overlay for this category
        activeOverlays.set(category, overlay);
    }
} 