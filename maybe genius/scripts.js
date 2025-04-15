document.addEventListener('DOMContentLoaded', function () {
    const dropdownBtn = document.getElementById('researchDropdown');
    const dropdownContent = document.getElementById('researchDropdownContent');

    dropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    const dropdownItems = dropdownContent.querySelectorAll('a');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                dropdownBtn.textContent = this.textContent + ' ▾';
                dropdownContent.style.display = 'none';
            } else {
                window.location.href = href;
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    });
});

function toggleDropdown() {
    const menu = document.getElementById("researchDropdownContent");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
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