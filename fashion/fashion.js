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
            return;
        }
        
        // Remove selected class from previously selected item
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        
        // Add new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.classList.add('overlay-image', 'active');
        overlay.dataset.category = category;
        overlayContainer.appendChild(overlay);
        
        // Update selected item
        selectedItems.set(category, item);
        item.classList.add('selected');
    });
});

// Activate first category by default
if (categoryButtons.length > 0) {
    categoryButtons[0].click();
} 