// Category and overlay management
const categoryButtons = document.querySelectorAll('.category-button');
const categoryItems = document.querySelectorAll('.category-items');
const overlayContainer = document.querySelector('.overlay-container');
let selectedItems = new Map(); // Track selected items by category

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
        
        // If clicking the same item, remove it
        if (selectedItems.get(category) === item) {
            const existingOverlay = document.querySelector(`[src="${overlayPath}"]`);
            if (existingOverlay) {
                existingOverlay.remove();
            }
            selectedItems.delete(category);
            item.classList.remove('selected');
            return;
        }
        
        // Remove selected class from previously selected item in this category
        const previousItem = selectedItems.get(category);
        if (previousItem) {
            previousItem.classList.remove('selected');
            const previousOverlay = document.querySelector(`[src="${previousItem.dataset.overlay}"]`);
            if (previousOverlay) {
                previousOverlay.remove();
            }
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