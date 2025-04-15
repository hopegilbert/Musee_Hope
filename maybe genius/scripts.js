document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown buttons
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    dropdownBtns.forEach(btn => {
        // Handle click events
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== dropdown && content.classList.contains('show')) {
                    content.classList.remove('show');
                    content.style.maxHeight = null;
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                dropdown.style.maxHeight = dropdown.scrollHeight + "px";
            } else {
                dropdown.style.maxHeight = null;
            }
        });

        // Add keyboard accessibility
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.dropdown-btn')) {
            document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
                dropdown.classList.remove('show');
                dropdown.style.maxHeight = null;
            });
        }
    });

    // Handle dropdown item selection
    const dropdownItems = document.querySelectorAll('.dropdown-content a');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedText = this.textContent;
            const btn = this.closest('.dropdown').querySelector('.dropdown-btn');
            btn.textContent = selectedText;
            
            // Close the dropdown
            const dropdown = this.closest('.dropdown-content');
            dropdown.classList.remove('show');
            dropdown.style.maxHeight = null;

            // Optional: Add animation to show selection was made
            btn.classList.add('selected');
            setTimeout(() => btn.classList.remove('selected'), 500);
        });
    });

    // Dropdown functionality
    const dropdownBtn = document.getElementById('researchDropdown');
    const dropdownContent = document.getElementById('researchDropdownContent');

    // Toggle dropdown on button click
    dropdownBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-content')) {
            dropdownContent.style.display = 'none';
        }
    });

    // Handle dropdown item selection
    const dropdownItemsResearch = dropdownContent.getElementsByTagName('a');
    for (let i = 0; i < dropdownItemsResearch.length; i++) {
        dropdownItemsResearch[i].addEventListener('click', function() {
            dropdownBtn.textContent = this.textContent + ' ▾';
            dropdownContent.style.display = 'none';
        });
    }
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