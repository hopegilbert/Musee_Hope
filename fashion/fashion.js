// Category and overlay management
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');
const overlayContainer = document.querySelector('.overlay-container');
const overlays = new Map(); // Store active overlays

// Initialize with first category active
if (categoryButtons.length > 0 && categoryItems.length > 0) {
    categoryButtons[0].classList.add('active');
    categoryItems[0].classList.add('active');
}

// Handle category switching
categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetCategory = button.getAttribute('data-category');
        console.log('Clicked category:', targetCategory);
        
        // Remove active class from all buttons and items
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        categoryItems.forEach(items => items.classList.remove('active'));
        
        // Add active class to clicked button and corresponding items
        button.classList.add('active');
        const targetItems = document.querySelector(`.category-items[data-category="${targetCategory}"]`);
        if (targetItems) {
            targetItems.classList.add('active');
            console.log('Found and activated items for category:', targetCategory);
        } else {
            console.log('Could not find items for category:', targetCategory);
        }
    });
});

// Handle clothing item clicks
document.querySelectorAll('.clothing-item').forEach(item => {
    item.addEventListener('click', () => {
        const overlayPath = item.dataset.overlay;
        if (!overlayPath) return;

        // Check if this overlay already exists
        let overlay = overlays.get(overlayPath);
        
        if (!overlay) {
            // Create new overlay if it doesn't exist
            overlay = document.createElement('img');
            overlay.src = overlayPath;
            overlay.classList.add('overlay-image');
            overlayContainer.appendChild(overlay);
            overlays.set(overlayPath, overlay);
        }

        // Toggle overlay visibility
        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        } else {
            overlay.classList.add('active');
        }
    });
}); 