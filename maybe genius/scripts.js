document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown buttons and their content
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        // Toggle dropdown on button click
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        // Handle dropdown item selection
        const items = content.querySelectorAll('a');
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                btn.textContent = this.textContent + ' ▾';
                content.style.display = 'none';
                // Navigate to the selected link
                window.location.href = this.href;
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.style.display = 'none';
        });
    });
});

function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown-content');
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-content');
    const button = document.querySelector('.dropdown-btn');
    
    if (!dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.style.display = "none";
    }
});

// Add click handler to dropdown button
document.querySelector('.dropdown-btn').addEventListener('click', function(event) {
    event.stopPropagation();
    toggleDropdown();
}); 