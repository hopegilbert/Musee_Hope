// Category and overlay management
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');
const overlayContainer = document.querySelector('.overlay-container');
const activeOverlays = new Set();

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

// Handle clothing item clicks
document.querySelectorAll('.clothing-item').forEach(item => {
    item.addEventListener('click', () => {
        const overlayPath = item.dataset.overlay;
        
        // Create or update overlay
        let overlay = document.querySelector(`[src="${overlayPath}"]`);
        if (!overlay) {
            overlay = document.createElement('img');
            overlay.src = overlayPath;
            overlay.classList.add('overlay-image');
            overlayContainer.appendChild(overlay);
        }
        
        // Toggle overlay visibility
        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            activeOverlays.delete(overlayPath);
        } else {
            overlay.classList.add('active');
            activeOverlays.add(overlayPath);
        }
    });
});

// Activate first category by default
if (categoryButtons.length > 0) {
    categoryButtons[0].click();
} 