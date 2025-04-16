// Dropdown menu functionality
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    
    // Close all other dropdowns
    allDropdowns.forEach(d => {
        if (d !== dropdown && d.classList.contains('active')) {
            d.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
}

// Topic dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click listeners to all topic dropdowns
    const dropdowns = document.querySelectorAll('.topic-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(event) {
            const content = this.querySelector('.topic-content');
            const icon = this.querySelector('.dropdown-icon');
            
            content.classList.toggle('active');
            icon.classList.toggle('active');
            
            // Prevent click from propagating to parent elements
            event.stopPropagation();
        });
    });
});
 
 
 