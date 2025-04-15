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
        
        // If clicking the same item, just remove it
        const currentlySelected = selectedItems.get(category);
        if (currentlySelected === item) {
            selectedItems.delete(category);
            item.classList.remove('selected');
            const existingOverlay = overlayContainer.querySelector(`img[data-category="${category}"]`);
            if (existingOverlay) {
                existingOverlay.remove();
            }
            return;
        }
        
        // Remove selected class from previously selected item
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        
        // Remove existing overlay for this category if it exists
        const existingOverlay = overlayContainer.querySelector(`img[data-category="${category}"]`);
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Add new overlay
        const overlay = document.createElement('img');
        overlay.src = overlayPath;
        overlay.classList.add('overlay-image');
        overlay.dataset.category = category;
        overlay.style.zIndex = categoryZIndex[category];
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